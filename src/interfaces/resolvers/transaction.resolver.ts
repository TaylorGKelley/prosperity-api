import { type ContextType } from '@/infrastructure/apollo';
import { type Resolvers, type Transaction } from '@/types/schema';

const transactionsResolver: Resolvers<ContextType> = {
	Query: {
		transactions: async (_parent, _args, _context, _info) => {
			// Fetch transactions logic here
			return [{ id: '', amount: 0.34, date: Date.now(), description: '' }];
		},
	},
	Mutation: {
		createTransaction: async (_parent, args, _context, _info) => {
			// const transaction = args.input;

			return {
				id: '',
				amount: 0.34,
				date: Date.now(),
				description: '',
			};
		},
	},
};

export default transactionsResolver;
