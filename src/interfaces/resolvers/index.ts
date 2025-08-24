import { mergeResolvers } from '@graphql-tools/merge';
import { DateResolver, DateTimeResolver } from 'graphql-scalars';
import transactionResolver from './transaction.resolver';
import categoryResolver from './category.resolver';
import accountResolver from './account.resolver';

const resolvers = mergeResolvers([
	{
		Date: DateResolver,
		DateTime: DateTimeResolver,
	},
	transactionResolver,
	categoryResolver,
	accountResolver,
]);

export default resolvers;
