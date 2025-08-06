import { db } from '@/infrastructure/database';
import { transactionTable } from '@/infrastructure/database/schema';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  type Transaction,
} from '@/types/schema';
import { User } from '@/types/User';
import { and, eq } from 'drizzle-orm';
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

  public async getAll(): Promise<Transaction[]> {
    const result = (await db
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.userId, this._userId))) as Transaction[];

    return result;
  }

  public async get(id: UUID): Promise<Transaction | undefined> {
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

  public async create(input: CreateTransactionInput): Promise<Transaction> {
    const result = (
      await db
        .insert(transactionTable)
        .values({ ...input, userId: this._userId })
        .returning()
    )[0] as Transaction;

    return result;
  }

  public async update(input: UpdateTransactionInput): Promise<Transaction> {
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

  public async delete(id: UUID): Promise<UUID> {
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
