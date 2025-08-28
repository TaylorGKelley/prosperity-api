import { db } from '@/infrastructure/database';
import { budgetTable, userTable } from '@/infrastructure/database/schema';
import { Budget } from '@/types/schema';
import { type User } from '@/types/User';
import { eq, getTableColumns } from 'drizzle-orm';
import { type UUID } from 'node:crypto';

export class Budgets {
  public static forUser(user: User | null) {
    if (user === null) throw new Error('Unauthorized');

    return new Budgets(user.id);
  }

  private _userId: UUID;
  public constructor(userId: UUID) {
    this._userId = userId;
  }

  public async get(): Promise<Budget> {
    const result = (
      await db
        .select(getTableColumns(budgetTable))
        .from(budgetTable)
        .innerJoin(userTable, eq(userTable.budgetId, budgetTable.id))
        .where(eq(userTable.id, this._userId))
    )[0];

    return result;
  }

  public async create(): Promise<Budget> {
    let result: typeof budgetTable.$inferSelect | undefined = undefined;
    await db.transaction(async (tx) => {
      const user = (
        await tx.select().from(userTable).where(eq(userTable.id, this._userId))
      )[0];

      // If the user doesn't already have a budget, create one
      if (!user.budgetId) {
        result = (await tx.insert(budgetTable).values({}).returning())[0];

        await tx
          .update(userTable)
          .set({
            budgetId: result.id,
          })
          .where(eq(userTable.id, this._userId));
      } else {
        tx.rollback();
      }
    });

    if (!result) {
      throw new Error('User already has a budget');
    }

    return result;
  }
}
