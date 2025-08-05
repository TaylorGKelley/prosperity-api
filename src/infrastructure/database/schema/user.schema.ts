import { pgTable, serial, uuid } from 'drizzle-orm/pg-core';

export const userTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: serial('user_id'),
});
