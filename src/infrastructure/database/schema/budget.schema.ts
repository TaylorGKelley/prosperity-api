import { relations } from 'drizzle-orm';
import { boolean, pgTable, unique, uuid, varchar } from 'drizzle-orm/pg-core';
import { categoryTable, colorEnum } from './category.schema';
import { savingGoalTable } from './savingGoal.schema';
import { accountTable } from './account.schema';
import { userBudgetTable } from './userBudget.schema';

export const budgetTable = pgTable(
  'budget',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 256 }).notNull(),
    color: colorEnum('color')
      .notNull()
      .default(
        colorEnum.enumValues[
          Math.floor(Math.random() * colorEnum.enumValues.length)
        ]
      ),
    isDefault: boolean('is_default').notNull().default(false),
  },
  (table) => [unique().on(table.id), unique().on(table.name)]
);

export const budgetRelations = relations(budgetTable, ({ many }) => ({
  categories: many(categoryTable),
  savingGoals: many(savingGoalTable),
  accounts: many(accountTable),
  userBudgets: many(userBudgetTable),
}));
