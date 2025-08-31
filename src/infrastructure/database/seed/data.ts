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
	{
		id: '94d7e28c-1774-4229-9a94-8c576514bd54' as UUID,
		budgetId: budgetData[0].id as UUID,
		accessToken: 'encryptedAccessToken',
		accessTokenIV: 'access_token_iv',
		tellerId: 'Teller Id',
	},
];

export const categoryData: (typeof categoryTable.$inferInsert)[] = [
	{
		id: 'c229599a-2f96-42e8-a512-132c13c0d19f' as UUID,
		budgetId: budgetData[0].id as UUID,
		name: 'Food',
		amount: 15.22,
	},
];

export const transactionData: (typeof transactionTable.$inferInsert)[] = [
	{
		id: '96513437-815e-48e1-9070-df1ad9a02da3' as UUID,
		tellerId: 'TellerID',
		accountId: accountData[0].id!,
		categoryId: null, // user can set it later
		amount: 10.23,
		date: new Date(),
		description: 'Test Transaction',
		status: TransactionStatusEnum.Posted,
		type: 'type',
		metadata: {
			category: 'clothing',
			counterparty: {
				name: 'name',
				type: 'organization',
			},
			processingStatus: 'complete',
		},
	},
	{
		id: '9b5f3efb-b01a-4f12-b556-9be06175e77f' as UUID,
		tellerId: 'TellerID2',
		accountId: accountData[0].id!,
		categoryId: null, // user can set it later
		amount: 99.99,
		date: new Date(),
		description: 'Test Transaction 2',
		status: TransactionStatusEnum.Posted,
		type: 'type',
		metadata: {
			category: 'bar',
			counterparty: {
				name: 'name',
				type: 'organization',
			},
			processingStatus: 'complete',
		},
	},
];
