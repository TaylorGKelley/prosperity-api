import { date, decimal, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { budgetTable } from './budget.schema';
import { relations } from 'drizzle-orm';

/**
 * startDate - Denotes the month the category should be active for, when updating insert a new record with the current month so that previous months aren't effected.
 *  if there is already a category for this month, just update it to cut down on the amount of junk records and keep it more simple
 *
 * endDate - when a category is deleted, set endDate to (the beginning of that month OR current date) to maintain previous months budgets
 */
export const categoryTable = pgTable('category', {
  id: uuid('id').primaryKey().defaultRandom(),
  budgetId: uuid('budget_id')
    .references(() => budgetTable.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  name: varchar('name').notNull(),
  amount: decimal('amount', { mode: 'number' }).notNull(),
  startDate: date('start_date', { mode: 'date' }).notNull().defaultNow(),
  endDate: date('end_date', { mode: 'date' }),
});

export const categoryRelations = relations(categoryTable, ({ one }) => ({
  budget: one(budgetTable, {
    fields: [categoryTable.budgetId],
    references: [budgetTable.id],
  }),
}));
