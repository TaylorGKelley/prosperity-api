import { db } from '@/infrastructure/database';
import { budgetTable, userBudgetTable } from '@/infrastructure/database/schema';
import {
  Budget,
  MutationCreateBudgetArgs,
  MutationDeleteBudgetArgs,
  MutationUpdateBudgetArgs,
  QueryBudgetArgs,
} from '@/types/schema';
import { type User } from '@/types/User';
import { and, eq, getTableColumns, not } from 'drizzle-orm';
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

  public async getAll(): Promise<Budget[]> {
    const result = await db
      .select(getTableColumns(budgetTable))
      .from(budgetTable)
      .innerJoin(userBudgetTable, eq(userBudgetTable.budgetId, budgetTable.id))
      .where(eq(userBudgetTable.userId, this._userId));

    return result;
  }

  public async get({ id }: QueryBudgetArgs): Promise<Budget> {
    const result = (
      await db
        .select(getTableColumns(budgetTable))
        .from(budgetTable)
        .innerJoin(
          userBudgetTable,
          eq(userBudgetTable.budgetId, budgetTable.id)
        )
        .where(
          and(eq(budgetTable.id, id), eq(userBudgetTable.userId, this._userId))
        )
    )[0];

    return result;
  }

  public async create({ input }: MutationCreateBudgetArgs): Promise<Budget> {
    let result: typeof budgetTable.$inferSelect;
    await db.transaction(async (tx) => {
      result = (
        await tx
          .insert(budgetTable)
          .values({
            name: input.name,
            isDefault: input.isDefault || undefined,
          })
          .returning()
      )[0];

      if (input.isDefault) {
        // set all other budgets to not be default
        await tx
          .update(budgetTable)
          .set({
            isDefault: false,
          })
          .where(not(eq(budgetTable.id, result.id)));
      }

      await tx
        .insert(userBudgetTable)
        .values({ userId: this._userId, budgetId: result.id });
    });

    return result!;
  }

  public async update({ input }: MutationUpdateBudgetArgs): Promise<Budget> {
    let result: typeof budgetTable.$inferSelect;
    await db.transaction(async (tx) => {
      // Update budget information
      result = (
        await tx
          .update(budgetTable)
          .set({
            name: input.name || undefined,
            isDefault: input.isDefault || undefined,
          })
          .where(eq(budgetTable.id, input.id))
          .returning()
      )[0];

      if (input.isDefault) {
        // set all other budgets to not be default
        await tx
          .update(budgetTable)
          .set({
            isDefault: false,
          })
          .where(not(eq(budgetTable.id, result.id)));
      }
    });

    return result!;
  }

  public async delete({ id }: MutationDeleteBudgetArgs): Promise<UUID> {
    const result = (
      await db
        .delete(budgetTable)
        .where(eq(budgetTable.id, id))
        .returning({ id: budgetTable.id })
    )[0];

    return result.id as UUID;
  }
}
