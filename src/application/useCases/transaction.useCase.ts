import { Transaction } from '@/domain/entities/transaction.entity';

export const getTransactionById = async (
	transactionId: Transaction['id']
): Promise<Transaction> => {
	return {
		id: transactionId,
		amount: 100.0,
		currency: 'USD',
		date: new Date(),
		description: 'Sample Transaction',
	};
};
