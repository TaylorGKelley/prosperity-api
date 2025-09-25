import { SavingGoals } from '@/application/useCases/SavingGoals.useCase';
import { type ContextType } from '@/infrastructure/configuration/apollo';
import { type Resolvers } from '@/types/schema';

const savingGoalResolver: Resolvers<ContextType> = {
	Query: {
		savingGoals: async (_parent, { budgetId }, { req }, _info) => {
			return await SavingGoals.forUser(req.user).getAll({
				budgetId,
			});
		},
		savingGoal: async (_parent, { id }, { req }, _info) => {
			const savingGoal = await SavingGoals.forUser(req.user).get({ id });

			if (!savingGoal) throw new Error('Cannot find a savingGoal with that Id');

			return savingGoal;
		},
	},
	Mutation: {
		createSavingGoal: async (_parent, { input }, { req }, _info) => {
			return await SavingGoals.forUser(req.user).create({ input });
		},
		updateSavingGoal: async (_parent, { input }, { req }, _info) => {
			return SavingGoals.forUser(req.user).update({ input });
		},
		deleteSavingGoal: async (_parent, { id }, { req }, _info) => {
			return SavingGoals.forUser(req.user).delete({ id });
		},
	},
};
