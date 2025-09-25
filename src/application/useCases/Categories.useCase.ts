import crypto, { type UUID } from 'node:crypto';
import {
  type Category,
  type QueryCategoriesArgs,
  type QueryCategoryArgs,
  type MutationCreateCategoryArgs,
  type MutationUpdateCategoryArgs,
  type MutationDeleteCategoryArgs,
} from '@/types/schema';
import { type User } from '@/types/User';
import { db } from '@/infrastructure/database';
import { categoryTable } from '@/infrastructure/database/schema/category.schema';
import { and, asc, eq, getTableColumns, gte, isNull, or } from 'drizzle-orm';
import {
  budgetTable,
  transactionTable,
  userBudgetTable,
} from '@/infrastructure/database/schema';
import { lte } from 'drizzle-orm';
import { Transactions } from './Transactions.useCase';

export class Categories {
  public static forUser(user: User | null) {
    if (user === null) throw new Error('Unauthorized');

    return new Categories(user.id);
  }

  private _userId: UUID;
  private readonly _categoryColumns = {
    ...getTableColumns(categoryTable),
    budget: { ...getTableColumns(budgetTable) },
  };
  public constructor(userId: UUID) {
    this._userId = userId;
  }

  public async getAll({ monthDate }: QueryCategoriesArgs): Promise<Category[]> {
    // First, get all transactions for the month
    const transactions = await Transactions.forUser({
      id: this._userId,
    } as User).getAll({ monthDate: monthDate });

    // Calculate totals per category
    const totals = new Map<string, number>();
    transactions.items.forEach((transaction) => {
      const key = transaction.category?.id || 'other';
      totals.set(key, (totals.get(key) || 0) + transaction.amount);
    });

    // Then get categories
    const categories = await db
      .select({ ...getTableColumns(categoryTable) })
      .from(categoryTable)
      .innerJoin(budgetTable, eq(budgetTable.id, categoryTable.budgetId))
      .innerJoin(userBudgetTable, eq(userBudgetTable.budgetId, budgetTable.id))
      .where(
        and(
          eq(userBudgetTable.userId, this._userId),
          !monthDate
            ? undefined
            : lte(
                categoryTable.startDate,
                new Date(
                  monthDate.getUTCFullYear(),
                  monthDate.getUTCMonth() + 1,
                  0
                )
              ),
          !monthDate
            ? undefined
            : or(
                isNull(categoryTable.endDate),
                gte(
                  categoryTable.endDate,
                  new Date(
                    monthDate.getUTCFullYear(),
                    monthDate.getUTCMonth(),
                    1
                  )
                )
              )
        )
      )
      .orderBy(asc(categoryTable.name))
      .groupBy();

    // Combine categories with totals
    const result: Category[] = categories.map((category) => ({
      ...category,
      totalSpent: totals.get(category.id) ?? 0,
    }));

    // Add "other" category if there are uncategorized transactions
    const otherAmount = totals.get('other');
    if (otherAmount) {
      result.push({
        id: crypto.randomUUID(),
        name: 'Other',
        amount: 0,
        budget: {
          id: '',
          isDefault: false,
        },
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: null,
        totalSpent: otherAmount,
      } as Category);
    }

    return result;
  }

  public async get({ id }: QueryCategoryArgs): Promise<Category | undefined> {
    const result = (
      await db
        .select(this._categoryColumns)
        .from(categoryTable)
        .innerJoin(budgetTable, eq(budgetTable.id, categoryTable.budgetId))
        .innerJoin(
          userBudgetTable,
          eq(userBudgetTable.budgetId, budgetTable.id)
        )
        .where(
          and(
            eq(userBudgetTable.userId, this._userId),
            eq(categoryTable.id, id)
          )
        )
    )[0];

    return result;
  }

  public async create({
    input,
  }: MutationCreateCategoryArgs): Promise<Category> {
    const result = (
      await db
        .insert(categoryTable)
        .values({
          ...input,
          startDate: new Date(),
        })
        .returning()
    )[0] as Category;

    return result;
  }

  public async update({
    input,
  }: MutationUpdateCategoryArgs): Promise<Category> {
    const category = (
      await db
        .select(getTableColumns(categoryTable))
        .from(categoryTable)
        .innerJoin(budgetTable, eq(budgetTable.id, categoryTable.budgetId))
        .innerJoin(
          userBudgetTable,
          eq(userBudgetTable.budgetId, budgetTable.id)
        )
        .where(
          and(
            eq(categoryTable.id, input.id),
            eq(userBudgetTable.userId, this._userId)
          )
        )
    )[0];

    if (!category) throw new Error('Invalid category id');

    let result: typeof categoryTable.$inferSelect;

    // If StartDate is < this month, create a new category and set the old end date to last month
    if (category.startDate < new Date(new Date().setDate(1))) {
      result = (
        await db
          .update(categoryTable)
          .set({
            name: input.name !== null ? input.name : undefined,
            amount: input.amount !== null ? input.amount : undefined,
          })
          .where(eq(categoryTable.id, category.id))
          .returning()
      )[0];
    } else {
      await db.transaction(async (tx) => {
        await tx
          .update(categoryTable)
          .set({
            endDate: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 1,
              1
            ),
          })
          .where(eq(categoryTable.id, category.id));

        result = (
          await tx
            .insert(categoryTable)
            .values({
              name: input.name != null ? input.name : '',
              budgetId: category.budgetId,
              amount: input.amount != null ? input.amount! : 0,
            })
            .returning()
        )[0];
      });
    }

    return result!;
  }

  public async delete({ id }: MutationDeleteCategoryArgs): Promise<UUID> {
    // Setting end dates will maintian categories for past months so that users can
    // view their history without it being altered from deleting categories in the future
    const category = await this.get({ id });
    if (
      !category ||
      (category?.endDate &&
        category?.endDate <
          new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    )
      // This prevents deleting categories that have already been ended
      throw new Error('Cannot find a category with that Id');

    let result: Category | undefined;
    if (category.startDate.getMonth() < new Date().getMonth()) {
      result = (
        await db
          .update(categoryTable)
          .set({
            endDate: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 1,
              1
            ),
          })
          .returning()
      )[0] as Category;

      // Update any transactions at or after end date of category + 1 month (1st of that month), set to null
      await db
        .update(transactionTable)
        .set({ categoryId: null })
        .where(eq(transactionTable.id, result.id));
    } else {
      // else if (startDate >= this month) then delete
      result = (
        await db
          .delete(categoryTable)
          .where(
            and(
              eq(categoryTable.budgetId, category.budgetId),
              eq(categoryTable.id, id)
            )
          )
          .returning()
      )[0] as Category;
    }

    return result.id as UUID;
  }
}
