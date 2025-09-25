import { db } from '@/infrastructure/database';
import {
  accountTable,
  budgetTable,
  userBudgetTable,
} from '@/infrastructure/database/schema';
import { type User } from '@/types/User';
import { and, eq, getTableColumns } from 'drizzle-orm';
import { type UUID } from 'node:crypto';
import { AccessToken } from '../utils/AccessToken';
import TellerClient from '@/infrastructure/configuration/teller-client';
import {
  StatusEnum,
  SubtypeEnum,
  TypeEnum,
  type Account,
  type MutationCreateAccountArgs,
  type MutationDeleteAccountArgs,
  type QueryAccountArgs,
} from '@/types/schema';
import snakeToPascalCase from '../utils/snakeToPascalCase';

export class Accounts {
  public static forUser(user: User | null) {
    if (user === null) throw new Error('Unauthorized');

    return new Accounts(user.id);
  }

  private _userId: UUID;
  private readonly _accountColumns = {
    ...getTableColumns(accountTable),
    budget: { ...getTableColumns(budgetTable) },
  };
  public constructor(userId: UUID) {
    this._userId = userId;
  }

  public async getAll(): Promise<Account[]> {
    const accountRecords = await db
      .select(this._accountColumns)
      .from(accountTable)
      .innerJoin(budgetTable, eq(budgetTable.id, accountTable.budgetId))
      .innerJoin(userBudgetTable, eq(userBudgetTable.budgetId, budgetTable.id))
      .where(eq(userBudgetTable.userId, this._userId));

    const result: Account[] = [];
    for (const accountRecord of accountRecords) {
      const accessToken = AccessToken.decrypt(
        accountRecord.accessToken,
        accountRecord.accessTokenIV
      );

      const accountInfo = await new TellerClient(accessToken).getAccount(
        accountRecord.tellerId
      );

      result.push({
        id: accountRecord.id,
        budget: accountRecord.budget,
        currency: accountInfo.currency,
        enrollmentId: accountInfo.enrollment_id,
        institution: accountInfo.institution,
        lastFour: parseInt(accountInfo.last_four),
        name: accountInfo.name,
        type: TypeEnum[
          snakeToPascalCase(accountInfo.type) as keyof typeof TypeEnum
        ],
        subtype:
          SubtypeEnum[
            snakeToPascalCase(accountInfo.subtype) as keyof typeof SubtypeEnum
          ],
        status:
          StatusEnum[
            snakeToPascalCase(accountInfo.status) as keyof typeof StatusEnum
          ],
      });
    }

    return result;
  }
  public async get({ id }: QueryAccountArgs): Promise<Account> {
    const result = (
      await db
        .select(this._accountColumns)
        .from(accountTable)
        .innerJoin(budgetTable, eq(budgetTable.id, accountTable.budgetId))
        .innerJoin(
          userBudgetTable,
          eq(userBudgetTable.budgetId, budgetTable.id)
        )
        .where(
          and(eq(accountTable.id, id), eq(userBudgetTable.userId, this._userId))
        )
    )[0];

    const accessToken = AccessToken.decrypt(
      result.accessToken,
      result.accessTokenIV
    );

    const accountInfo = await new TellerClient(accessToken).getAccount(
      result.tellerId
    );

    return {
      id: result.id,
      budget: result.budget,
      currency: accountInfo.currency,
      enrollmentId: accountInfo.enrollment_id,
      institution: accountInfo.institution,
      lastFour: parseInt(accountInfo.last_four),
      name: accountInfo.name,
      type: TypeEnum[
        snakeToPascalCase(accountInfo.type) as keyof typeof TypeEnum
      ],
      subtype:
        SubtypeEnum[
          snakeToPascalCase(accountInfo.subtype) as keyof typeof SubtypeEnum
        ],
      status:
        StatusEnum[
          snakeToPascalCase(accountInfo.status) as keyof typeof StatusEnum
        ],
    };
  }

  public async create({
    input,
  }: MutationCreateAccountArgs): Promise<Account[]> {
    const { iv: accessTokenIV, encryptedToken: accessToken } =
      AccessToken.encrypt(input.accessToken);

    const budget = (
      await db
        .select(getTableColumns(budgetTable))
        .from(budgetTable)
        .innerJoin(
          userBudgetTable,
          eq(userBudgetTable.budgetId, budgetTable.id)
        )
        .where(eq(userBudgetTable.userId, this._userId))
    )[0];

    const accounts = await new TellerClient(input.accessToken).getAccounts();

    try {
      const results = await db
        .insert(accountTable)
        .values(
          accounts.map((account) => ({
            budgetId: budget.id,
            tellerId: account.id,
            accessToken,
            accessTokenIV,
          }))
        )
        .returning({
          id: accountTable.id,
          tellerId: accountTable.tellerId,
        });

      return results.map((result) => {
        const accountInfo = accounts.find(
          (account) => account.id == result.tellerId
        )!;

        return {
          id: result.id,
          budget: budget,
          currency: accountInfo.currency,
          enrollmentId: accountInfo.enrollment_id,
          institution: accountInfo.institution,
          lastFour: parseInt(accountInfo.last_four),
          name: accountInfo.name,
          type: TypeEnum[
            snakeToPascalCase(accountInfo.type) as keyof typeof TypeEnum
          ],
          subtype:
            SubtypeEnum[
              snakeToPascalCase(accountInfo.subtype) as keyof typeof SubtypeEnum
            ],
          status:
            StatusEnum[
              snakeToPascalCase(accountInfo.status) as keyof typeof StatusEnum
            ],
        };
      });
    } catch {
      throw new Error('Account is already linked');
    }
  }

  public async delete({
    id,
  }: MutationDeleteAccountArgs): Promise<Account['id']> {
    let result: typeof accountTable.$inferSelect;

    await db.transaction(async (tx) => {
      try {
        result = (
          await db
            .delete(accountTable)
            .where(eq(accountTable.id, id))
            .returning()
        )[0];

        if (!result) throw new Error('Account with that Id was not found');

        const accessToken = AccessToken.decrypt(
          result.accessToken,
          result.accessTokenIV
        );

        await new TellerClient(accessToken).deleteAccount(id);
      } catch (error) {
        await tx.rollback();
      }
    });

    return result!.id;
  }
}
