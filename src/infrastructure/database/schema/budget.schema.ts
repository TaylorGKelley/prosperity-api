import { relations } from 'drizzle-orm';
import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { categoryTable } from './category.schema';
import { savingGoalTable } from './savingGoal.schema';
import { accountTable } from './account.schema';
import { userBudgetTable } from './userBudget.schema';

export const budgetTable = pgTable('budget', {
  id: uuid('id').primaryKey().defaultRandom(),
});

export const budgetRelations = relations(budgetTable, ({ many }) => ({
  categories: many(categoryTable),
  savingGoals: many(savingGoalTable),
  accounts: many(accountTable),
  userBudgets: many(userBudgetTable),
}));
