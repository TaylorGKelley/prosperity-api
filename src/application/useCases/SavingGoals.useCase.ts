import { db } from '@/infrastructure/database';
import { savingGoalTable } from '@/infrastructure/database/schema/savingGoal.schema';
import {
	type QuerySavingGoalArgs,
	type QuerySavingGoalsArgs,
	type MutationCreateSavingGoalArgs,
	MutationUpdateSavingGoalArgs,
	MutationDeleteSavingGoalArgs,
	SavingGoal,
} from '@/types/schema';
import { type User } from '@/types/User';
import { eq } from 'drizzle-orm';
import { type UUID } from 'node:crypto';

export class SavingGoals {
	public static forUser(user: User | null) {
		if (user === null) throw new Error('Unauthorized');

		return new SavingGoals(user.id);
	}

	private _userId: UUID;
	public constructor(userId: UUID) {
		this._userId = userId;
	}

	public async getAll({
		budgetId,
	}: QuerySavingGoalsArgs): Promise<SavingGoal[]> {
		return await db
			.select()
			.from(savingGoalTable)
			.where(eq(savingGoalTable.budgetId, budgetId));
	}

	public async get({
		id,
	}: QuerySavingGoalArgs): Promise<SavingGoal | undefined> {
		return (
			await db.select().from(savingGoalTable).where(eq(savingGoalTable.id, id))
		)[0];
	}

	public async create({
		input,
	}: MutationCreateSavingGoalArgs): Promise<SavingGoal> {
		const result = (
			await db.insert(savingGoalTable).values(input).returning()
		)[0];

		return result;
	}

	public async update({
		input,
	}: MutationUpdateSavingGoalArgs): Promise<SavingGoal> {
		const result = (
			await db
				.update(savingGoalTable)
				.set({
					title: input.title || undefined,
					contributionAmount: input.contributionAmount || undefined,
					targetAmount: input.targetAmount || undefined,
					prioritize: input.prioritized || undefined,
				})
				.where(eq(savingGoalTable.id, input.id))
				.returning()
		)[0];

		return result as SavingGoal;
	}

	public async delete({ id }: MutationDeleteSavingGoalArgs): Promise<UUID> {
		const result = (
			await db
				.delete(savingGoalTable)
				.where(eq(savingGoalTable.id, id))
				.returning({ id: savingGoalTable.id })
		)[0];

		return result.id as UUID;
	}
}
