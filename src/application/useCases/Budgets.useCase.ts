import { db } from '@/infrastructure/database';
import { budgetTable, userBudgetTable } from '@/infrastructure/database/schema';
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

  // TODO: Fix to handle mutliple budgets per user
  public async get(): Promise<Budget> {
    const result = (
      await db
        .select(getTableColumns(budgetTable))
        .from(budgetTable)
        .innerJoin(
          userBudgetTable,
          eq(userBudgetTable.budgetId, budgetTable.id)
        )
        .where(eq(userBudgetTable.userId, this._userId))
    )[0];

    return result;
  }

  public async create(): Promise<Budget> {
    let result: typeof budgetTable.$inferSelect | undefined = undefined;
    await db.transaction(async (tx) => {
      result = (await tx.insert(budgetTable).values({}).returning())[0];

      await tx
        .insert(userBudgetTable)
        .values({ userId: this._userId, budgetId: result.id });
    });

    if (!result) {
      throw new Error('User already has a budget');
    }

    return result;
  }
}
