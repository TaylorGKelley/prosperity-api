import crypto, { type UUID } from 'node:crypto';
import { transactionTable } from '../schema';
import { categoryTable } from '../schema/category.schema';
import { userTable } from '../schema/user.schema';

export const userData: (typeof userTable.$inferInsert)[] = [
  {
    id: 'e3d9287c-3eeb-4a67-b7a9-c0dba079a087' as UUID, //crypto.randomUUID(),
  },
];

export const categoryData: (typeof categoryTable.$inferInsert)[] = [
  {
    id: crypto.randomUUID(),
    userId: userData[0].id as UUID,
    name: 'Food',
    amount: 15.22,
    startDate: new Date(Date.now()),
    // endDate: new Date(2025, 9, 1),
  },
];

export const transactionData: (typeof transactionTable.$inferInsert)[] = [
  {
    id: crypto.randomUUID(),
    userId: userData[0].id as UUID,
    title: 'Test Transaction',
    amount: 15.22,
    transactionType: 'cash',
    date: new Date(Date.now()),
    description: 'A sample test transaction',
  },
];
