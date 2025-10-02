import { randomUUID, type UUID } from 'node:crypto';
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
import {
  and,
  asc,
  eq,
  getTableColumns,
  gt,
  gte,
  isNull,
  or,
  sql,
} from 'drizzle-orm';
import {
  budgetTable,
  transactionTable,
  userBudgetTable,
} from '@/infrastructure/database/schema';
import { lte } from 'drizzle-orm';

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

  public async getAll({
    monthDate,
    budgetId,
  }: QueryCategoriesArgs): Promise<Category[]> {
    // Then get categories
    const result: Category[] = await db
      .select({
        ...getTableColumns(categoryTable),
        budget: { ...getTableColumns(budgetTable) },
        totalSpent: db.$count(
          transactionTable,
          eq(transactionTable.categoryId, categoryTable.id)
        ),
      })
      .from(categoryTable)
      .innerJoin(budgetTable, eq(budgetTable.id, categoryTable.budgetId))
      .innerJoin(userBudgetTable, eq(userBudgetTable.budgetId, budgetTable.id))
      .where(
        and(
          eq(userBudgetTable.userId, this._userId),
          budgetId
            ? eq(budgetTable.id, budgetId)
            : eq(budgetTable.isDefault, true),
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
      .orderBy(asc(categoryTable.name));

    const otherCategoryTransactions = (
      await db
        .select({ amount: sql`sum(${transactionTable.id})`.mapWith(Number) })
        .from(transactionTable)
        .where(
          and(
            lte(
              transactionTable.date,
              new Date(
                monthDate.getUTCFullYear(),
                monthDate.getUTCMonth() + 1,
                0
              )
            ),
            gt(
              transactionTable.date,
              new Date(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1)
            )
          )
        )
    )[0];

    if (otherCategoryTransactions.amount > 0) {
      result.push({
        id: randomUUID() as UUID,
        budget: result[0].budget,
        name: 'Uncategorized',
        amount: 0,
        totalSpent: otherCategoryTransactions.amount,
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      } satisfies Category);
    }

    return result;
  }

  public async get({ id }: QueryCategoryArgs): Promise<Category | undefined> {
    const result = (
      await db
        .select({
          ...getTableColumns(categoryTable),
          budget: { ...getTableColumns(budgetTable) },
          totalSpent: db.$count(
            transactionTable,
            eq(transactionTable.categoryId, categoryTable.id)
          ),
        })
        .from(categoryTable)
        .innerJoin(budgetTable, eq(budgetTable.id, categoryTable.budgetId))
        .innerJoin(
          userBudgetTable,
          eq(userBudgetTable.budgetId, budgetTable.id)
        )
        .where(
          and(
            eq(categoryTable.id, id),
            eq(userBudgetTable.userId, this._userId)
          )
        )
        .limit(1)
    )[0];

    return result as Category;
  }

  public async create({
    input,
  }: MutationCreateCategoryArgs): Promise<Category> {
    const category = (
      await db
        .insert(categoryTable)
        .values({
          ...input,
          startDate: new Date(),
        })
        .returning({ id: categoryTable.id })
    )[0];

    const result = (
      await db
        .select({
          ...getTableColumns(categoryTable),
          budget: { ...getTableColumns(budgetTable) },
          totalSpent: db.$count(
            transactionTable,
            eq(transactionTable.categoryId, categoryTable.id)
          ),
        })
        .from(categoryTable)
        .innerJoin(budgetTable, eq(budgetTable.id, categoryTable.budgetId))
        .where(eq(categoryTable.id, category.id))
        .limit(1)
    )[0];

    return result as Category;
  }

  public async update({
    input,
  }: MutationUpdateCategoryArgs): Promise<Category> {
    const oldCategory = (
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

    if (!oldCategory) throw new Error('Invalid category id');

    let category: Pick<typeof categoryTable.$inferSelect, 'id'>;

    // If StartDate is < this month, create a new category and set the old end date to last month
    if (oldCategory.startDate < new Date(new Date().setDate(1))) {
      category = (
        await db
          .update(categoryTable)
          .set({
            name: input.name !== null ? input.name : undefined,
            amount: input.amount !== null ? input.amount : undefined,
          })
          .where(eq(categoryTable.id, oldCategory.id))
          .returning({ id: categoryTable.id })
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
          .where(eq(categoryTable.id, oldCategory.id));

        category = (
          await tx
            .insert(categoryTable)
            .values({
              name: input.name != null ? input.name : '',
              budgetId: oldCategory.budgetId,
              amount: input.amount != null ? input.amount! : 0,
            })
            .returning({ id: categoryTable.id })
        )[0];
      });
    }

    const result = (
      await db
        .select({
          ...getTableColumns(categoryTable),
          budget: { ...getTableColumns(budgetTable) },
          totalSpent: db.$count(
            transactionTable,
            eq(transactionTable.categoryId, categoryTable.id)
          ),
        })
        .from(categoryTable)
        .innerJoin(budgetTable, eq(budgetTable.id, categoryTable.budgetId))
        .where(eq(categoryTable.id, category!.id))
        .limit(1)
    )[0];

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
    ) {
      // This prevents deleting categories that have already been ended
      throw new Error('Cannot find a category with that Id');
    }

    let result: Pick<typeof categoryTable.$inferSelect, 'id'>;
    if (category.startDate.getMonth() < new Date().getMonth()) {
      result = (
        await db
          .update(categoryTable)
          .set({
            endDate: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ),
          })
          .returning({ id: categoryTable.id })
      )[0];

      // Update any transactions at or after end date of category + 1 month (1st of that month), set to null
      await db
        .update(transactionTable)
        .set({ categoryId: null })
        .where(
          and(
            eq(transactionTable.id, result.id),
            gte(
              transactionTable.date,
              new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
            )
          )
        );
    } else {
      // else if (startDate >= this month) then delete
      result = (
        await db
          .delete(categoryTable)
          .where(
            and(
              eq(categoryTable.budgetId, category.budget.id),
              eq(categoryTable.id, id)
            )
          )
          .returning({ id: categoryTable.id })
      )[0];
    }

    return result.id as UUID;
  }
}
