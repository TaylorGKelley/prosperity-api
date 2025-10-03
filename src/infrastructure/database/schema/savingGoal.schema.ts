import { timestamp, unique, varchar } from 'drizzle-orm/pg-core';
import { real } from 'drizzle-orm/pg-core';
import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { budgetTable } from './budget.schema';
import { boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { colorEnum, iconEnum } from './category.schema';

export const savingGoalTable = pgTable(
  'saving_goal',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    budgetId: uuid('budget_id')
      .references(() => budgetTable.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    title: varchar('title', { length: 256 }).notNull(),
    icon: iconEnum('icon')
      .notNull()
      .default(
        iconEnum.enumValues[
          Math.floor(Math.random() * iconEnum.enumValues.length)
        ]
      ),
    color: colorEnum('color')
      .notNull()
      .default(
        colorEnum.enumValues[
          Math.floor(Math.random() * colorEnum.enumValues.length)
        ]
      ),
    targetAmount: real('target_amount').notNull(),
    currentAmount: real('current_amount').notNull().default(0),
    contributionAmount: real('contribution_amount').notNull(),
    lastContribution: timestamp('last_contribution').notNull().defaultNow(),
    prioritize: boolean('prioritize').notNull().default(false),
  },
  (table) => [unique().on(table.title), unique().on(table.budgetId)] // Unique titles (based on the budget)
);

export const savingGoalRelations = relations(savingGoalTable, ({ one }) => ({
  budget: one(budgetTable, {
    fields: [savingGoalTable.budgetId],
    references: [budgetTable.id],
  }),
}));
