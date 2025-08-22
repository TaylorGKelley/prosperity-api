import { pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { budgetTable } from './budget.schema';

export const linkedAccountTable = pgTable('linked_account', {
	id: uuid('id').primaryKey().defaultRandom(),
	budgetId: uuid('budget_id')
		.references(() => budgetTable.id, {
			onDelete: 'cascade',
		})
		.notNull(),
	accessToken: text('access_token').notNull(),
	accessTokenIV: varchar('access_token_iv', { length: 64 }),
});
