import { db } from '@/infrastructure/database';
import {
  accountTable,
  transactionTable,
  userTable,
} from '@/infrastructure/database/schema';
import {
  type QueryTransactionsArgs,
  type QueryTransactionArgs,
  // type MutationCreateTransactionArgs,
  // type MutationUpdateTransactionArgs,
  type Transaction,
  // type MutationDeleteTransactionArgs,
  type PaginatedTransaction,
  TransactionStatusEnum,
  SyncTransactions,
  SyncStatusEnum,
} from '@/types/schema';
import { User } from '@/types/User';
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gte,
  lt,
  lte,
  or,
} from 'drizzle-orm';
import { type UUID } from 'node:crypto';
import Cursor from '../utils/Cursor';
import { AccessToken } from '../utils/AccessToken';
import TellerClient from '@/infrastructure/configuration/teller-client';
import snakeToPascalCase from '../utils/snakeToPascalCase';

export class Transactions {
  public static forUser(user: User | null) {
    if (user === null) throw new Error('Unauthorized');

    return new Transactions(user.id);
  }

  private _userId: UUID;
  public constructor(userId: UUID) {
    this._userId = userId;
  }

  public async getAll({
    monthDate,
    pagination,
  }: QueryTransactionsArgs): Promise<PaginatedTransaction> {
    let cursorFilter = undefined;

    // Set the filter for pagination if it's part of the request
    if (pagination?.cursor) {
      const { date, id } = Cursor.decode(pagination.cursor);

      cursorFilter = or(
        lt(transactionTable.date, date), // smaller date
        and(eq(transactionTable.date, date), lt(transactionTable.id, id)) // same date but smaller id
      );
    }

    // Query the database
    const query = db
      .select(getTableColumns(transactionTable))
      .from(transactionTable)
      .innerJoin(accountTable, eq(accountTable.id, transactionTable.accountId))
      .innerJoin(userTable, eq(userTable.budgetId, accountTable.budgetId))
      .where(
        and(
          eq(userTable.id, this._userId),
          !monthDate
            ? undefined
            : lte(
                transactionTable.date,
                new Date(
                  monthDate.getUTCFullYear(),
                  monthDate.getUTCMonth() + 1,
                  0
                )
              ),
          !monthDate
            ? undefined
            : gte(
                transactionTable.date,
                new Date(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1)
              )
        )
      )
      .orderBy(desc(transactionTable.date), desc(transactionTable.id));
    if (pagination?.count) query.limit(pagination.count + 1);

    const results = await query;

    // Get info for the next page
    const hasNextPage = pagination
      ? results.length > pagination.count
      : undefined;
    const items = pagination ? results.slice(0, pagination.count) : results;

    const endCursor =
      pagination && items
        ? items.length > 0
          ? Cursor.encode({
              date: items[items.length - 1].date.toISOString(),
              id: items[items.length - 1].id,
            })
          : null
        : undefined;
    return {
      items: items.map((item) => {
        return {
          ...item,
          status:
            TransactionStatusEnum[
              snakeToPascalCase(
                item.status
              ) as keyof typeof TransactionStatusEnum
            ],
        };
      }),
      pageInfo: pagination && {
        hasNextPage: hasNextPage!,
        endCursor: endCursor!,
      },
    };
  }

  public async get({
    id,
  }: QueryTransactionArgs): Promise<Transaction | undefined> {
    const result = (
      await db
        .select(getTableColumns(transactionTable))
        .from(transactionTable)
        .innerJoin(
          accountTable,
          eq(accountTable.id, transactionTable.accountId)
        )
        .innerJoin(userTable, eq(userTable.budgetId, accountTable.budgetId))
        .where(and(eq(userTable.id, this._userId), eq(transactionTable.id, id)))
    )?.[0];

    return {
      ...result,
      status:
        TransactionStatusEnum[
          snakeToPascalCase(result.status) as keyof typeof TransactionStatusEnum
        ],
    };
  }

  public async sync(): Promise<SyncTransactions> {
    try {
      const accounts = await db
        .select(getTableColumns(accountTable))
        .from(accountTable)
        .innerJoin(userTable, eq(userTable.budgetId, accountTable.budgetId))
        .where(eq(userTable.id, this._userId));
      console.log(accounts);

      await db.transaction(async (tw) => {
        try {
          // Get transaction's for each account
          const transactions: (typeof transactionTable.$inferInsert)[] = [];
          for (const account of accounts) {
            // Clear out any *Pending* transaction's to resync incase they are now posted
            tw.delete(transactionTable).where(
              eq(transactionTable.status, 'PENDING')
            );

            const lastTransaction:
              | typeof transactionTable.$inferSelect
              | undefined = (
              await tw
                .select()
                .from(transactionTable)
                .where(eq(transactionTable.accountId, account.id))
                .orderBy(asc(transactionTable.date), asc(transactionTable.id))
                .limit(1)
            )[0];

            const accessToken = AccessToken.decrypt(
              account.accessToken,
              account.accessTokenIV
            );

            const accountTransactions = await new TellerClient(
              accessToken
            ).getTransactions(
              account.tellerId,
              lastTransaction?.tellerId
                ? {
                    from_id: lastTransaction.tellerId,
                  }
                : undefined
            );

            accountTransactions.forEach((transaction) =>
              transactions.push({
                tellerId: transaction.id,
                accountId: account.id,
                categoryId: null, // user can set it later
                amount: parseFloat(transaction.amount),
                date: new Date(transaction.date),
                description: transaction.description,
                status:
                  TransactionStatusEnum[
                    snakeToPascalCase(
                      transaction.status
                    ) as keyof typeof TransactionStatusEnum
                  ],
                type: transaction.type,
                metadata: {
                  category: transaction.details.category,
                  counterparty: {
                    name: transaction.details.counterparty.name,
                    type: transaction.details.counterparty.type as
                      | 'organization'
                      | 'person',
                  },
                  processingStatus: transaction.details.processing_status,
                },
              })
            );
          }
          if (transactions.length > 0)
            await tw.insert(transactionTable).values(transactions);
        } catch (error) {
          await tw.rollback();
        }
      });

      return {
        status: SyncStatusEnum.Success,
      };
    } catch (error) {
      return { status: SyncStatusEnum.Error, error: (error as Error).message };
    }
  }

  // public async create({
  // 	input,
  // }: MutationCreateTransactionArgs): Promise<Transaction> {
  // 	const result = {} as Transaction;
  // 	await db
  // 		.insert(transactionTable)
  // 		.values({ ...input })
  // 		.returning()
  // )[0] as Transaction;

  // 	return result;
  // }

  // public async update({
  // 	input,
  // }: MutationUpdateTransactionArgs): Promise<Transaction> {
  // 	const result = (
  // 		await db
  // 			.update(transactionTable)
  // 			.set({
  // 				categoryId: input.categoryId || undefined,
  // 				amount: input.amount || undefined,
  // 				date: input.date || undefined,
  // 				description: input.description || undefined,
  // 			})
  // 			.where(
  // 				and(
  // 					// eq(transactionTable.userId, this._userId),
  // 					eq(transactionTable.id, input.id)
  // 				)
  // 			)
  // 			.returning()
  // 	)[0] as Transaction;

  // 	return result;
  // }

  // public async delete({ id }: MutationDeleteTransactionArgs): Promise<UUID> {
  // 	const result = (
  // 		await db
  // 			.delete(transactionTable)
  // 			.where(and(eq(transactionTable.id, id)))
  // 			.returning()
  // 	)[0];

  // 	return result.id as UUID;
  // }
}
