import { mergeResolvers } from '@graphql-tools/merge';
import { DateResolver, DateTimeResolver } from 'graphql-scalars';
import transactionResolver from './transaction.resolver';
import categoryResolver from './category.resolver';

const resolvers = mergeResolvers([
  {
    Date: DateResolver,
    DateTime: DateTimeResolver,
  },
  transactionResolver,
  categoryResolver,
]);

export default resolvers;
