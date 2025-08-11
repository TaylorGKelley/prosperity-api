import { db } from '@/infrastructure/database';
import { transactionTable } from '@/infrastructure/database/schema';
import {
  type QueryTransactionsArgs,
  type QueryTransactionByIdArgs,
  type MutationCreateTransactionArgs,
  type MutationUpdateTransactionArgs,
  type Transaction,
  MutationDeleteTransactionArgs,
} from '@/types/schema';
import { User } from '@/types/User';
import { and, eq, gt, lte } from 'drizzle-orm';
import { type UUID } from 'node:crypto';

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
  }: QueryTransactionsArgs): Promise<Transaction[]> {
    const query = db
      .select()
      .from(transactionTable)
      .where(
        and(
          eq(transactionTable.userId, this._userId),
          !monthDate
            ? undefined
            : lte(
                transactionTable.date,
                new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
              ),
          !monthDate
            ? undefined
            : gt(
                transactionTable.date,
                new Date(monthDate.getFullYear(), monthDate.getMonth(), 0)
              )
        )
      );

    if (pagination?.limit) query.limit(pagination.limit);
    if (pagination?.offset) query.offset(pagination.offset);

    const result = (await query) as Transaction[];

    return result;
  }

  public async get({
    id,
  }: QueryTransactionByIdArgs): Promise<Transaction | undefined> {
    const result = (
      await db
        .select()
        .from(transactionTable)
        .where(
          and(
            eq(transactionTable.userId, this._userId),
            eq(transactionTable.id, id)
          )
        )
    )?.[0] as Transaction;

    return result;
  }

  public async create({
    input,
  }: MutationCreateTransactionArgs): Promise<Transaction> {
    const result = (
      await db
        .insert(transactionTable)
        .values({ ...input, userId: this._userId })
        .returning()
    )[0] as Transaction;

    return result;
  }

  public async update({
    input,
  }: MutationUpdateTransactionArgs): Promise<Transaction> {
    const result = (
      await db
        .update(transactionTable)
        .set({
          categoryId: input.categoryId || undefined,
          title: input.title || undefined,
          amount: input.amount || undefined,
          transactionType: input.transactionType || undefined,
          date: input.date || undefined,
          description: input.description || undefined,
        })
        .where(
          and(
            eq(transactionTable.userId, this._userId),
            eq(transactionTable.id, input.id)
          )
        )
        .returning()
    )[0] as Transaction;

    return result;
  }

  public async delete({ id }: MutationDeleteTransactionArgs): Promise<UUID> {
    const result = (
      await db
        .delete(transactionTable)
        .where(
          and(
            eq(transactionTable.userId, this._userId),
            eq(transactionTable.id, id)
          )
        )
        .returning()
    )[0];

    return result.id as UUID;
  }
}
