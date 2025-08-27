import { Budgets } from '@/application/useCases/Budgets.useCase';
import { type ContextType } from '@/infrastructure/configuration/apollo';
import { type Resolvers } from '@/types/schema';

const budgetResolver: Resolvers<ContextType> = {
  Query: {
    budget: async (_parent, _args, { req }, _info) => {
      return await Budgets.forUser(req.user).get();
    },
  },
};

export default budgetResolver;
