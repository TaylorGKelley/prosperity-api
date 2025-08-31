import { Transactions } from '@/application/useCases/Transactions.useCase';
import { type ContextType } from '@/infrastructure/configuration/apollo';
import { type Resolvers } from '@/types/schema';

const transactionResolver: Resolvers<ContextType> = {
	Query: {
		transactions: async (
			_parent,
			{ monthDate, pagination },
			{ req },
			_info
		) => {
			return await Transactions.forUser(req.user).getAll({
				monthDate,
				pagination,
			});
		},
		transaction: async (_parent, { id }, { req }, _info) => {
			const transaction = await Transactions.forUser(req.user).get({ id });

			if (!transaction)
				throw new Error('Cannot find a transaction with that Id');

			return transaction;
		},
	},
	Mutation: {
		syncTransactions: async (_parent, _args, { req }, _info) => {
			return await Transactions.forUser(req.user).sync();
		},
		// createTransaction: async (_parent, { input }, { req }, _info) => {
		// 	return await Transactions.forUser(req.user).create({ input });
		// },
		// updateTransaction: async (_parent, { input }, { req }, _info) => {
		// 	return Transactions.forUser(req.user).update({ input });
		// },
		// deleteTransaction: async (_parent, { id }, { req }, _info) => {
		// 	return Transactions.forUser(req.user).delete({ id });
		// },
	},
};

export default transactionResolver;
