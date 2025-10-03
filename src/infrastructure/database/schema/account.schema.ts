import { pgTable, text, unique, uuid, varchar } from 'drizzle-orm/pg-core';
import { budgetTable } from './budget.schema';
import { relations } from 'drizzle-orm';
import { transactionTable } from './transaction.schema';
import { colorEnum } from './category.schema';

export const accountTable = pgTable(
  'account',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tellerId: varchar('teller_id', { length: 256 }).notNull(),
    budgetId: uuid('budget_id')
      .references(() => budgetTable.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    color: colorEnum('color')
      .notNull()
      .default(
        colorEnum.enumValues[
          Math.floor(Math.random() * colorEnum.enumValues.length)
        ]
      ),
    accessToken: text('access_token').notNull(),
    accessTokenIV: varchar('access_token_iv', { length: 64 }).notNull(),
  },
  (table) => [
    unique().on(table.id),
    unique().on(table.tellerId).nullsNotDistinct(),
  ]
);

export const accountRelations = relations(accountTable, ({ one, many }) => ({
  transactions: many(transactionTable),
  budget: one(budgetTable, {
    fields: [accountTable.budgetId],
    references: [budgetTable.id],
  }),
}));
