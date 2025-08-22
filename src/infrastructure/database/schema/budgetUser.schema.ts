import { boolean, pgTable, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './user.schema';
import { budgetTable } from './budget.schema';

export const budgetUserTable = pgTable('budget_user', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.references(() => userTable.id, {
			onDelete: 'cascade',
		})
		.notNull(),
	budgetId: uuid('budget_id')
		.references(() => budgetTable.id, {
			onDelete: 'cascade',
		})
		.notNull(),
	isOwner: boolean('is_owner').notNull().default(false),
});
