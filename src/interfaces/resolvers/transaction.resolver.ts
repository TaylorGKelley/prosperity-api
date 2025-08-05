import { Transactions } from '@/application/useCases/Transactions.useCase';
import { type ContextType } from '@/infrastructure/apollo';
import { type Resolvers } from '@/types/schema';
import { UUID } from 'node:crypto';

const transactionsResolver: Resolvers<ContextType> = {
  Query: {
    transactions: async (_parent, _args, _context, _info) => {
      return [{ id: '', amount: 0.34, date: Date.now(), description: '' }];
    },
    transactionById: async (_parent, { id }, _context, _info) => {
      const transaction = await Transactions.getTransaction(id as UUID)!;

      if (!transaction)
        throw new Error('Cannot find a transaction with that Id');

      return transaction;
    },
  },
  Mutation: {
    createTransaction: async (_parent, { input }, _context, _info) => {
      return {
        id: '',
        amount: 0.34,
        date: Date.now(),
        description: '',
      };
    },
    updateTransaction: async (_parent, { input }, _context, _info) => {
      return {
        id: '',
        amount: 0.34,
        date: Date.now(),
        description: '',
      };
    },
    deleteTransaction: async (_parent, { id }, _context, _info) => {
      return id;
    },
  },
};

export default transactionsResolver;
