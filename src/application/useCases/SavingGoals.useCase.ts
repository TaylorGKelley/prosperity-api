import { db } from '@/infrastructure/database';
import { budgetTable, userBudgetTable } from '@/infrastructure/database/schema';
import { savingGoalTable } from '@/infrastructure/database/schema/savingGoal.schema';
import {
  type QuerySavingGoalArgs,
  type QuerySavingGoalsArgs,
  type MutationCreateSavingGoalArgs,
  MutationUpdateSavingGoalArgs,
  MutationDeleteSavingGoalArgs,
  SavingGoal,
  ColorEnum,
  IconEnum,
} from '@/types/schema';
import { type User } from '@/types/User';
import { and, eq, getTableColumns } from 'drizzle-orm';
import { type UUID } from 'node:crypto';
import snakeToPascalCase from '../utils/snakeToPascalCase';

export class SavingGoals {
  public static forUser(user: User | null) {
    if (user === null) throw new Error('Unauthorized');

    return new SavingGoals(user.id);
  }

  private _userId: UUID;
  private readonly _savingGoalColumns = {
    ...getTableColumns(savingGoalTable),
    budget: { ...getTableColumns(budgetTable) },
  };
  public constructor(userId: UUID) {
    this._userId = userId;
  }

  public async getAll({
    budgetId,
  }: QuerySavingGoalsArgs): Promise<SavingGoal[]> {
    const results = await db
      .select(this._savingGoalColumns)
      .from(savingGoalTable)
      .innerJoin(budgetTable, eq(budgetTable.id, savingGoalTable.budgetId))
      .innerJoin(userBudgetTable, eq(userBudgetTable.budgetId, budgetTable.id))
      .where(
        and(
          eq(userBudgetTable.userId, this._userId),
          budgetId
            ? eq(budgetTable.id, budgetId)
            : eq(budgetTable.isDefault, true)
        )
      );

    return results.map(
      (result) =>
        ({
          ...result,
          color:
            ColorEnum[
              snakeToPascalCase(result.color) as keyof typeof ColorEnum
            ],
          icon: IconEnum[
            snakeToPascalCase(result.icon) as keyof typeof IconEnum
          ],
        } as SavingGoal)
    );
  }

  public async get({
    id,
  }: QuerySavingGoalArgs): Promise<SavingGoal | undefined> {
    const result = (
      await db
        .select(this._savingGoalColumns)
        .from(savingGoalTable)
        .innerJoin(budgetTable, eq(budgetTable.id, savingGoalTable.budgetId))
        .innerJoin(
          userBudgetTable,
          eq(userBudgetTable.budgetId, budgetTable.id)
        )
        .where(
          and(
            eq(savingGoalTable.id, id),
            eq(userBudgetTable.userId, this._userId)
          )
        )
    )[0];

    return (
      result &&
      ({
        ...result,
        color:
          ColorEnum[snakeToPascalCase(result.color) as keyof typeof ColorEnum],
        icon: IconEnum[snakeToPascalCase(result.icon) as keyof typeof IconEnum],
      } as SavingGoal)
    );
  }

  public async create({
    input,
  }: MutationCreateSavingGoalArgs): Promise<SavingGoal> {
    const result = (
      await db
        .insert(savingGoalTable)
        .values(input)
        .returning({ id: savingGoalTable.id })
    )[0];

    return (
      await db
        .select(this._savingGoalColumns)
        .from(savingGoalTable)
        .innerJoin(budgetTable, eq(budgetTable.id, savingGoalTable.budgetId))
        .where(eq(savingGoalTable.id, result.id))
    )[0] as SavingGoal;
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
          prioritize: input.prioritize || undefined,
        })
        .where(eq(savingGoalTable.id, input.id))
        .returning({ id: savingGoalTable.id })
    )[0];

    return (
      await db
        .select(this._savingGoalColumns)
        .from(savingGoalTable)
        .innerJoin(budgetTable, eq(budgetTable.id, savingGoalTable.budgetId))
        .where(eq(savingGoalTable.id, result.id))
    )[0] as SavingGoal;
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
