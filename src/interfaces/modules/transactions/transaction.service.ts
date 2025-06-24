export class TransactionService {
	async getTransactionById(transactionId: string): Promise<Transaction> {
		return {
			id: transactionId,
			amount: 100.0,
			currency: 'USD',
			date: new Date(),
			description: 'Sample Transaction',
		};
	}
}
