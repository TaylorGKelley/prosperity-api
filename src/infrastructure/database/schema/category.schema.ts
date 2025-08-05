import { date, decimal, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { userTable } from './user.schema';

/**
 * startDate - Denotes the month the category should be active for, when updating insert a new record with the current month so that previous months aren't effected.
 *  if there is already a category for this month, just update it to cut down on the amount of junk records and keep it more simple
 *
 * endDate - when a category is deleted, set endDate to (the beginning of that month OR current date) to maintain previous months budgets
 */
export const categoryTable = pgTable('category', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => userTable.id)
    .notNull(),
  name: varchar('name').notNull(),
  amount: decimal('amount', { mode: 'number' }).notNull(),
  startDate: date('start_date', { mode: 'date' }).notNull().defaultNow(),
  endDate: date('end_date', { mode: 'date' }),
});
