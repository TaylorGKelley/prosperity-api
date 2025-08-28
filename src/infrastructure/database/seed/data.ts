import crypto, { type UUID } from 'node:crypto';
import {
  budgetTable,
  transactionTable,
  categoryTable,
  userTable,
} from '../schema';

export const budgetData: (typeof budgetTable.$inferInsert)[] = [
  {
    id: crypto.randomUUID(),
  },
];

export const userData: (typeof userTable.$inferInsert)[] = [
  {
    id: 'e3d9287c-3eeb-4a67-b7a9-c0dba079a087' as UUID, //crypto.randomUUID(),
    budgetId: budgetData[0].id as UUID,
  },
];

export const categoryData: (typeof categoryTable.$inferInsert)[] = [
  {
    id: crypto.randomUUID(),
    budgetId: budgetData[0].id as UUID,
    name: 'Food',
    amount: 15.22,
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
