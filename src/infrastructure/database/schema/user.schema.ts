import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userBudgetTable } from './userBudget.schema';

export const userTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
});

export const userRelations = relations(userTable, ({ many }) => ({
  budgets: many(userBudgetTable),
}));
