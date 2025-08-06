import { type UUID } from 'node:crypto';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  type Category,
} from '@/types/schema';
import { type User } from '@/types/User';
import { db } from '@/infrastructure/database';
import { categoryTable } from '@/infrastructure/database/schema/category.schema';
import { and, eq } from 'drizzle-orm';

export class Categories {
  public static forUser(user: User | null) {
    if (user === null) throw new Error('Unauthorized');

    return new Categories(user.id);
  }

  private _userId: UUID;
  public constructor(userId: UUID) {
    this._userId = userId;
  }

  public async getAll(): Promise<Category[]> {
    const result = await db
      .select()
      .from(categoryTable)
      .where(eq(categoryTable.userId, this._userId));

    return result;
  }

  public async get(id: UUID): Promise<Category | undefined> {
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

  public async create(input: CreateCategoryInput): Promise<Category> {
    const result = (
      await db
        .insert(categoryTable)
        .values({ ...input, userId: this._userId })
        .returning()
    )[0] as Category;

    return result;
  }

  public async update(input: UpdateCategoryInput): Promise<Category> {
    const result = (
      await db
        .update(categoryTable)
        .set({
          name: input.name || undefined,
          amount: input.amount || undefined,
          startDate: input.startDate || undefined,
          endDate: input.endDate || undefined,
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

  public async delete(id: UUID): Promise<UUID> {
    const result = (
      await db
        .delete(categoryTable)
        .where(
          and(eq(categoryTable.userId, this._userId), eq(categoryTable.id, id))
        )
        .returning()
    )[0];

    return result.id as UUID;
  }
}
