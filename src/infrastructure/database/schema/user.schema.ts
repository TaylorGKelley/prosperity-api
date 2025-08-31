import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { budgetTable } from './budget.schema';

export const userTable = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	budgetId: uuid('budget_id').references(() => budgetTable.id, {
		onDelete: 'set null',
	}),
});
