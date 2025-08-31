import { pgTable, uuid } from 'drizzle-orm/pg-core';

export const budgetTable = pgTable('budget', {
	id: uuid('id').primaryKey().defaultRandom(),
});
