import { mergeResolvers } from '@graphql-tools/merge';
import { DateResolver, DateTimeResolver } from 'graphql-scalars';
import transactionsResolver from './transaction.resolver';

const resolvers = mergeResolvers([
	{
		Date: DateResolver,
		DateTime: DateTimeResolver,
	},
	transactionsResolver,
]);

export default resolvers;
