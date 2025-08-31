import { pgTable, text, unique, uuid, varchar } from 'drizzle-orm/pg-core';
import { budgetTable } from './budget.schema';

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
		accessToken: text('access_token').notNull(),
		accessTokenIV: varchar('access_token_iv', { length: 64 }).notNull(),
	},
	(table) => [unique().on(table.tellerId).nullsNotDistinct()]
);
