import { Budgets } from '@/application/useCases/Budgets.useCase';
import { type ContextType } from '@/infrastructure/configuration/apollo';
import { type Resolvers } from '@/types/schema';

const budgetResolver: Resolvers<ContextType> = {
  Query: {
    budgets: async (_parent, _args, { req }, _info) => {
      return await Budgets.forUser(req.user).getAll();
    },
    budget: async (_parent, { id }, { req }, _info) => {
      return await Budgets.forUser(req.user).get({ id });
    },
  },
  Mutation: {
    createBudget: async (_parent, { input }, { req }, _info) => {
      return await Budgets.forUser(req.user).create({ input });
    },
    updateBudget: async (_parent, { input }, { req }, _info) => {
      return await Budgets.forUser(req.user).update({ input });
    },
    deleteBudget: async (_parent, { id }, { req }, _info) => {
      return await Budgets.forUser(req.user).delete({ id });
    },
  },
};

export default budgetResolver;
