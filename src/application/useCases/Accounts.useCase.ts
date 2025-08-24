import { db } from '@/infrastructure/database';
import {
	accountTable,
	budgetTable,
	userTable,
} from '@/infrastructure/database/schema';
import { type User } from '@/types/User';
import { and, eq, getTableColumns } from 'drizzle-orm';
import { type UUID } from 'node:crypto';
import { AccessToken } from '../utils/AccessToken';
import TellerClient from '@/infrastructure/configuration/teller-client';
import {
	type Account,
	type MutationCreateAccountArgs,
	type MutationDeleteAccountArgs,
	type QueryAccountArgs,
} from '@/types/schema';

export class Accounts {
	public static forUser(user: User | null) {
		if (user === null) throw new Error('Unauthorized');

		return new Accounts(user.id);
	}

	private _userId: UUID;
	public constructor(userId: UUID) {
		this._userId = userId;
	}

	public async getAll(): Promise<Account[]> {
		const accounts = await db
			.select(getTableColumns(accountTable))
			.from(accountTable)
			.innerJoin(budgetTable, eq(budgetTable.id, accountTable.budgetId))
			.innerJoin(userTable, eq(userTable.budgetId, budgetTable.id))
			.where(eq(userTable.id, this._userId));

		const result: Account[] = [];
		for (const account of accounts) {
			const accessToken = AccessToken.decrypt(
				account.accessToken,
				account.accessTokenIV
			);

			const accountInfo = new TellerClient(accessToken).getAccount(
				account.accountId
			);

			result.push({
				id: account.id as UUID,
			});
		}

		return result;
	}
	public async get({ id }: QueryAccountArgs): Promise<Account> {
		return {
			id,
		};
	}

	public async create({
		input,
	}: MutationCreateAccountArgs): Promise<Account[]> {
		const { iv: accessTokenIV, encryptedToken: accessToken } =
			AccessToken.encrypt(input.accessToken);

		const { budgetId } = (
			await db
				.select({ budgetId: userTable.budgetId })
				.from(userTable)
				.where(eq(userTable.id, this._userId))
		)[0];

		if (!budgetId)
			throw new Error('Please create a budget before linking accounts');

		const accounts = await new TellerClient(input.accessToken).getAccounts();

		const results = await db
			.insert(accountTable)
			.values(
				accounts.map((account) => ({
					budgetId,
					accountId: account.id,
					accessToken,
					accessTokenIV,
				}))
			)
			.returning();

		return results.map((result) => ({
			id: result.id,
		}));
	}

	public async delete({
		id,
	}: MutationDeleteAccountArgs): Promise<Account['id']> {
		const result = (
			await db
				.delete(accountTable)
				.where(and(eq(accountTable.id, id)))
				.returning()
		)[0];

		if (!result) throw new Error('Account with that Id was not found');

		const accessToken = AccessToken.decrypt(
			result.accessToken,
			result.accessTokenIV
		);

		await new TellerClient(accessToken).deleteAccount(id);

		return result.id;
	}
}
