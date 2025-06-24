import { GraphQLScalarType, Kind } from 'graphql';
import { IResolvers } from '@graphql-tools/utils';
import { getTransactionById } from '@/application/useCases/transaction.useCase';
import { Transaction } from '@/domain/entities/transaction.entity';

// Custom Date scalar implementation
const DateScalar = new GraphQLScalarType({
	name: 'Date',
	description: 'Custom Date scalar type',
	serialize(value: unknown) {
		return value instanceof Date ? value.toISOString() : value;
	},
	parseValue(value: unknown) {
		return typeof value === 'string' ? new Date(value) : value;
	},
	parseLiteral(ast) {
		return ast.kind === Kind.STRING ? new Date(ast.value) : null;
	},
});

export const transactionResolvers: IResolvers = {
	Date: DateScalar,
	Query: {
		// transactions: async (): Promise<Transaction[]> => {
		// 	return transactionService.getAllTransactions();
		// },
		transaction: async (
			_: unknown,
			args: { id: string }
		): Promise<Transaction | null> => {
			return getTransactionById(args.id);
		},
	},
	Mutation: {
		// createTransaction: async (
		// 	_: unknown,
		// 	args: { input: Omit<Transaction, 'id'> }
		// ): Promise<Transaction> => {
		// 	return transactionService.createTransaction(args.input);
		// },
		// updateTransaction: async (
		// 	_: unknown,
		// 	args: { input: Partial<Transaction> & { id: string } }
		// ): Promise<Transaction> => {
		// 	return transactionService.updateTransaction(args.input);
		// },
		// deleteTransaction: async (
		// 	_: unknown,
		// 	args: { id: string }
		// ): Promise<boolean> => {
		// 	return transactionService.deleteTransaction(args.id);
		// },
	},
};
