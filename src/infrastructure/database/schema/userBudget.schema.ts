import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './user.schema';
import { budgetTable } from './budget.schema';
import { relations } from 'drizzle-orm';

export const userBudgetTable = pgTable(
  'user_budget',
  {
    userId: uuid('user_id')
      .references(() => userTable.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    budgetId: uuid('budget_id')
      .references(() => budgetTable.id, {
        onDelete: 'cascade',
      })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.budgetId] })]
);

export const userBudgetRelations = relations(userBudgetTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userBudgetTable.userId],
    references: [userTable.id],
  }),
  budget: one(budgetTable, {
    fields: [userBudgetTable.budgetId],
    references: [budgetTable.id],
  }),
}));
