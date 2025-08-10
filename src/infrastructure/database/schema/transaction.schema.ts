import {
	date,
	pgEnum,
	pgTable,
	real,
	text,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';
import { categoryTable } from './category.schema';
import { userTable } from './user.schema';

export const transactionTypeEnum = pgEnum('transaction_type', [
	'cash',
	'debit_card',
	'credit_card',
	'bank_transfer',
	'check',
	'gift_card',
]);

export const transactionTable = pgTable('transaction', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.references(() => userTable.id, {
			onDelete: 'cascade',
		})
		.notNull(),
	categoryId: uuid('category_id').references(() => categoryTable.id, {
		onDelete: 'set null',
	}),
	title: varchar('title').notNull(),
	amount: real('amount').notNull(),
	transactionType: transactionTypeEnum('transaction_type').notNull(),
	date: date('date', { mode: 'date' }).notNull().defaultNow(),
	description: text('description'),
});
