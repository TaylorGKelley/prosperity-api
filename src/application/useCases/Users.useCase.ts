import { db } from '@/infrastructure/database';
import { userTable } from '@/infrastructure/database/schema/user.schema';

export class Users {
  public static async createUser(user: typeof userTable.$inferInsert) {
    const result = (await db.insert(userTable).values(user).returning())[0];

    return result;
  }
}
