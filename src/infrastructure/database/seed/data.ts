import { type UUID } from 'node:crypto';
import {
  budgetTable,
  transactionTable,
  categoryTable,
  userTable,
  accountTable,
} from '../schema';
import { TransactionStatusEnum } from '@/types/schema';

export const budgetData: (typeof budgetTable.$inferInsert)[] = [
  {
    id: '6a1515c3-fabd-4ac9-a839-61d6b3093c41' as UUID,
  },
];

export const userData: (typeof userTable.$inferInsert)[] = [
  {
    id: 'e3d9287c-3eeb-4a67-b7a9-c0dba079a087' as UUID,
    budgetId: budgetData[0].id as UUID,
  },
];

export const accountData: (typeof accountTable.$inferInsert)[] = [
  // {
  // 	id: '94d7e28c-1774-4229-9a94-8c576514bd54' as UUID,
  // 	budgetId: budgetData[0].id as UUID,
  // 	accessToken: 'encryptedAccessToken',
  // 	accessTokenIV: 'access_token_iv',
  // 	tellerId: 'Teller Id',
  // },
];

export const categoryData: (typeof categoryTable.$inferInsert)[] = [
  {
    id: 'c229599a-2f96-42e8-a512-132c13c0d19f' as UUID,
    budgetId: budgetData[0].id as UUID,
    name: 'Food',
    amount: 15.22,
  },
];

export const transactionData: (typeof transactionTable.$inferInsert)[] = [];
