import { mergeResolvers } from '@graphql-tools/merge';
import { DateResolver, DateTimeResolver } from 'graphql-scalars';
import transactionResolver from './transaction.resolver';
import categoryResolver from './category.resolver';
import accountResolver from './account.resolver';
import budgetResolver from './budget.resolver';

const resolvers = mergeResolvers([
  {
    Date: DateResolver,
    DateTime: DateTimeResolver,
  },
  transactionResolver,
  categoryResolver,
  budgetResolver,
  accountResolver,
]);

export default resolvers;
