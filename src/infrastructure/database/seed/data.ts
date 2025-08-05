import { UUID } from 'node:crypto';
import { transactionTable } from '../schema';

export const transactionData: (typeof transactionTable.$inferInsert)[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000' as UUID,
    amount: 15.22,
    date: new Date(Date.now()),
    description: 'A sample test transaction',
  },
];
