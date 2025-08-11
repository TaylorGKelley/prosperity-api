import { type UUID } from 'node:crypto';
import {
  type Category,
  type QueryCategoriesArgs,
  type QueryCategoryByIdArgs,
  type MutationCreateCategoryArgs,
  type MutationUpdateCategoryArgs,
  type MutationDeleteCategoryArgs,
} from '@/types/schema';
import { type User } from '@/types/User';
import { db } from '@/infrastructure/database';
import { categoryTable } from '@/infrastructure/database/schema/category.schema';
import { and, eq, gt, lte } from 'drizzle-orm';

export class Categories {
  public static forUser(user: User | null) {
    if (user === null) throw new Error('Unauthorized');

    return new Categories(user.id);
  }

  private _userId: UUID;
  public constructor(userId: UUID) {
    this._userId = userId;
  }

  public async getAll({
    monthDate,
    pagination,
  }: QueryCategoriesArgs): Promise<Category[]> {
    const query = db
      .select()
      .from(categoryTable)
      .where(
        and(
          eq(categoryTable.userId, this._userId),
          !monthDate
            ? undefined
            : lte(
                categoryTable.startDate,
                new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
              ),
          !monthDate
            ? undefined
            : gt(
                categoryTable.endDate,
                new Date(monthDate.getFullYear(), monthDate.getMonth(), 0)
              )
        )
      );

    if (pagination?.limit) query.limit(pagination.limit);
    if (pagination?.offset) query.offset(pagination.offset);

    const result = await query;

    return result;
  }

  public async get({
    id,
  }: QueryCategoryByIdArgs): Promise<Category | undefined> {
    const result = (
      await db
        .select()
        .from(categoryTable)
        .where(
          and(eq(categoryTable.userId, this._userId), eq(categoryTable.id, id))
        )
    )?.[0];

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
          // starDate: new Date(), // Defaults to now
          userId: this._userId,
        })
        .returning()
    )[0] as Category;

    return result;
  }

  public async update({
    input,
  }: MutationUpdateCategoryArgs): Promise<Category> {
    // TODO: If StartDate is < this month, create a new category and set the old end date to last month

    const result = (
      await db
        .update(categoryTable)
        .set({
          name: input.name !== null ? input.name : undefined,
          amount: input.amount !== null ? input.amount : undefined,
        })
        .where(
          and(
            eq(categoryTable.userId, this._userId),
            eq(categoryTable.id, input.id)
          )
        )
        .returning()
    )[0] as Category;

    return result;
  }

  public async delete({ id }: MutationDeleteCategoryArgs): Promise<UUID> {
    // Setting end dates will maintian categories for past months so that users can
    // view their history without it being altered from deleting categories in the future

    const category = await this.get({ id });
    if (!category || (category?.endDate && category?.endDate < new Date()))
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
      )[0];
    } else {
      // startDate >= this month
      result = (
        await db
          .delete(categoryTable)
          .where(
            and(
              eq(categoryTable.userId, this._userId),
              eq(categoryTable.id, id)
            )
          )
          .returning()
      )[0];
    }

    return result.id as UUID;
  }
}
