import { db } from '@/infrastructure/database';
import { transactionTable } from '@/infrastructure/database/schema';
import { Transaction } from '@/types/schema';
import { eq } from 'drizzle-orm';
import { type UUID } from 'node:crypto';

export class Transactions {
  public static async getTransaction(
    id: UUID
  ): Promise<Transaction | undefined> {
    const result = (
      await db
        .select()
        .from(transactionTable)
        .where(eq(transactionTable.id, id))
    )?.[0];

    return result;
  }
}
