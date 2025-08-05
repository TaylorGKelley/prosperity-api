import { UUID } from 'node:crypto';
import { transactionTable } from '../schema';
import { categoryTable } from '../schema/category.schema';
import { userTable } from '../schema/user.schema';

export const userData: (typeof userTable.$inferInsert)[] = [
  {
    id: '550e8400-e29b-41d4-a716-446123654789',
    userId: 0,
  },
];

export const categoryData: (typeof categoryTable.$inferInsert)[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000' as UUID,
    userId: '550e8400-e29b-41d4-a716-446123654789',
    name: 'Food',
    amount: 15.22,
    startDate: new Date(Date.now()),
    // endDate: new Date(2025, 9, 1),
  },
];

export const transactionData: (typeof transactionTable.$inferInsert)[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000' as UUID,
    userId: '550e8400-e29b-41d4-a716-446123654789',
    title: 'Test Transaction',
    amount: 15.22,
    transactionType: 'cash',
    date: new Date(Date.now()),
    description: 'A sample test transaction',
  },
];
