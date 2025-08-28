import { pgTable, text, unique, uuid, varchar } from 'drizzle-orm/pg-core';
import { budgetTable } from './budget.schema';

export const accountTable = pgTable(
  'account',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    budgetId: uuid('budget_id')
      .references(() => budgetTable.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    accountId: varchar('account_id', { length: 256 }).notNull(),
    accessToken: text('access_token').notNull(),
    accessTokenIV: varchar('access_token_iv', { length: 64 }).notNull(),
  },
  (table) => [unique().on(table.accountId).nullsNotDistinct()]
);
