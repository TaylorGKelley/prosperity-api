import { date, pgTable, real, text, uuid } from 'drizzle-orm/pg-core';

export const transactionTable = pgTable('transaction', {
  id: uuid('id').primaryKey().defaultRandom(),
  amount: real('amount').notNull(),
  date: date('date', { mode: 'date' }).notNull().defaultNow(),
  description: text('description'),
});
