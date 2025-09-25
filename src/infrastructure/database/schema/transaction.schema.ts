import {
  date,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { categoryTable } from './category.schema';
import { accountTable } from './account.schema';
import { relations } from 'drizzle-orm';

export const transactionTypeEnum = pgEnum('transaction_type', [
  'CASH',
  'DEBIT_CARD',
  'CREDIT_CARD',
  'BANK_TRANSFER',
  'CHECK',
  'GIFT_CARD',
]);

export const statusEnum = pgEnum('status', ['POSTED', 'PENDING']);

export type TransactionMetadata = {
  processingStatus: 'pending' | 'complete';
  category:
    | 'accommodation'
    | 'advertising'
    | 'bar'
    | 'charity'
    | 'clothing'
    | 'dining'
    | 'education'
    | 'electronics'
    | 'entertainment'
    | 'fuel'
    | 'general'
    | 'groceries'
    | 'health'
    | 'home'
    | 'income'
    | 'insurance'
    | 'investment'
    | 'loan'
    | 'office'
    | 'phone'
    | 'service'
    | 'shopping'
    | 'software'
    | 'sport'
    | 'tax'
    | 'transport'
    | 'transportation'
    | 'utilities';
  counterparty: {
    name: string | null;
    type: 'organization' | 'person';
  };
};

export const transactionTable = pgTable('transaction', {
  id: uuid('id').primaryKey().defaultRandom(),
  tellerId: varchar('teller_id', { length: 256 }).unique().notNull(),
  accountId: uuid('account_id')
    .references(() => accountTable.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  categoryId: uuid('category_id').references(() => categoryTable.id, {
    onDelete: 'set null',
  }),
  amount: real('amount').notNull(),
  date: date('date', { mode: 'date' }).notNull().defaultNow(),
  description: text('description').notNull(),
  status: statusEnum('status').notNull(),
  type: varchar('type', { length: 128 }).notNull(),
  metadata: jsonb('metadata').$type<TransactionMetadata>(),
});

export const transactionRelations = relations(transactionTable, ({ one }) => ({
  account: one(accountTable, {
    fields: [transactionTable.accountId],
    references: [accountTable.id],
  }),
}));
