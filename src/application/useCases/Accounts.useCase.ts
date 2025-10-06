import { db } from '@/infrastructure/database';
import {
  accountTable,
  budgetTable,
  userBudgetTable,
} from '@/infrastructure/database/schema';
import { type User } from '@/types/User';
import { and, eq, getTableColumns, or } from 'drizzle-orm';
import { type UUID } from 'node:crypto';
import { AccessToken } from '../utils/AccessToken';
import TellerClient from '@/infrastructure/configuration/teller-client';
import {
  QueryAccountsArgs,
  AccountStatusEnum,
  AccountSubtypeEnum,
  AccountTypeEnum,
  type Account,
  type MutationCreateAccountArgs,
  type MutationDeleteAccountArgs,
  type QueryAccountArgs,
  ColorEnum,
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

  public async getAll({ budgetId }: QueryAccountsArgs): Promise<Account[]> {
    const accountRecords = await db
      .select(this._accountColumns)
      .from(accountTable)
      .innerJoin(budgetTable, eq(budgetTable.id, accountTable.budgetId))
      .innerJoin(userBudgetTable, eq(userBudgetTable.budgetId, budgetTable.id))
      .where(
        and(
          eq(userBudgetTable.userId, this._userId),
          budgetId
            ? eq(budgetTable.id, budgetId)
            : eq(budgetTable.isDefault, true)
        )
      );

    const result: Account[] = [];
    for (const accountRecord of accountRecords) {
      const accessToken = AccessToken.decrypt(
        accountRecord.accessToken,
        accountRecord.accessTokenIV
      );

      const tellerClient = new TellerClient(accessToken);
      const accountInfo = await tellerClient.getAccount(accountRecord.tellerId);
      const balance = await tellerClient.getBalances(accountInfo.id);

      result.push({
        id: accountRecord.id,
        budget: {
          ...accountRecord.budget,
          color:
            ColorEnum[
              snakeToPascalCase(
                accountRecord.budget.color
              ) as keyof typeof ColorEnum
            ],
        },
        balance: balance.available ? parseFloat(balance.available) : 0,
        currency: accountInfo.currency,
        enrollmentId: accountInfo.enrollment_id,
        institution: accountInfo.institution,
        lastFour: parseInt(accountInfo.last_four),
        name: accountInfo.name,
        color:
          ColorEnum[
            snakeToPascalCase(accountRecord.color) as keyof typeof ColorEnum
          ],
        type: AccountTypeEnum[
          snakeToPascalCase(accountInfo.type) as keyof typeof AccountTypeEnum
        ],
        subtype:
          AccountSubtypeEnum[
            snakeToPascalCase(
              accountInfo.subtype
            ) as keyof typeof AccountSubtypeEnum
          ],
        status:
          AccountStatusEnum[
            snakeToPascalCase(
              accountInfo.status
            ) as keyof typeof AccountStatusEnum
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

    const tellerClient = new TellerClient(accessToken);
    const accountInfo = await tellerClient.getAccount(result.tellerId);
    const balance = await tellerClient.getBalances(accountInfo.id);

    return {
      id: result.id,
      budget: {
        ...result.budget,
        color:
          ColorEnum[
            snakeToPascalCase(result.budget.color) as keyof typeof ColorEnum
          ],
      },
      balance: balance.available ? parseFloat(balance.available) : 0,
      currency: accountInfo.currency,
      enrollmentId: accountInfo.enrollment_id,
      institution: accountInfo.institution,
      lastFour: parseInt(accountInfo.last_four),
      name: accountInfo.name,
      color:
        ColorEnum[snakeToPascalCase(result.color) as keyof typeof ColorEnum],
      type: AccountTypeEnum[
        snakeToPascalCase(accountInfo.type) as keyof typeof AccountTypeEnum
      ],
      subtype:
        AccountSubtypeEnum[
          snakeToPascalCase(
            accountInfo.subtype
          ) as keyof typeof AccountSubtypeEnum
        ],
      status:
        AccountStatusEnum[
          snakeToPascalCase(
            accountInfo.status
          ) as keyof typeof AccountStatusEnum
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

    const tellerClient = new TellerClient(input.accessToken);
    const accounts = await tellerClient.getAccounts();

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
          color: accountTable.color,
        });

      return await Promise.all(
        results.map(async (result) => {
          const accountInfo = accounts.find(
            (account) => account.id == result.tellerId
          )!;
          const balance = await tellerClient.getBalances(accountInfo.id);

          return {
            id: result.id,
            budget: {
              ...budget,
              color:
                ColorEnum[
                  snakeToPascalCase(budget.color) as keyof typeof ColorEnum
                ],
            },
            balance: balance.available ? parseFloat(balance.available) : 0,
            currency: accountInfo.currency,
            enrollmentId: accountInfo.enrollment_id,
            institution: accountInfo.institution,
            lastFour: parseInt(accountInfo.last_four),
            name: accountInfo.name,
            color:
              ColorEnum[
                snakeToPascalCase(result.color) as keyof typeof ColorEnum
              ],
            type: AccountTypeEnum[
              snakeToPascalCase(
                accountInfo.type
              ) as keyof typeof AccountTypeEnum
            ],
            subtype:
              AccountSubtypeEnum[
                snakeToPascalCase(
                  accountInfo.subtype
                ) as keyof typeof AccountSubtypeEnum
              ],
            status:
              AccountStatusEnum[
                snakeToPascalCase(
                  accountInfo.status
                ) as keyof typeof AccountStatusEnum
              ],
          };
        })
      );
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
