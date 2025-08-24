import https from 'https';
import fs from 'fs';

type TellerAccountResponse = {
	currency: string;
	enrollment_id: string;
	id: string;
	institution: {
		id: string;
		name: string;
	};
	last_four: string;
	links: {
		self: string;
		details: string;
		balance: string;
		transactions: string;
	};
	name: string;
	type: 'depository' | 'credit';
	subtype:
		| 'checking'
		| 'savings'
		| 'money_market'
		| 'certificate_of_deposit'
		| 'treasury'
		| 'sweep'
		| 'credit_card';
	status: 'open' | 'closed';
};

type TellerTransactionResponse = {
	account_id: string;
	amount: string;
	date: string;
	description: string;
	details: {
		processing_status: 'pending' | 'complete';
		category:
			| 'accommodation'
			| 'advertising'
			| 'bar'
			| 'charity'
			| 'clothing'
			| 'dining'
			| 'education'
			| 'electronics'
			| 'entertainment'
			| 'fuel'
			| 'general'
			| 'groceries'
			| 'health'
			| 'home'
			| 'income'
			| 'insurance'
			| 'investment'
			| 'loan'
			| 'office'
			| 'phone'
			| 'service'
			| 'shopping'
			| 'software'
			| 'sport'
			| 'tax'
			| 'transport'
			| 'transportation'
			| 'utilities';
		counterparty: {
			name: string;
			type: string;
		};
	};
	status: 'posted' | 'pending';
	id: string;
	links: {
		self: string;
		account: string;
	};
	type: string;
};

type TellerBalanceResponse = {
	account_id: string;
	ledger?: string;
	available?: string;
	links: {
		self: string;
		account: string;
	};
};

export default class TellerClient {
	private _baseURL = 'https://api.teller.io';
	private _httpsAgent: https.Agent | undefined;
	private _accessToken: string;

	constructor(accessToken: string) {
		this._accessToken = accessToken;

		// Load mTLS certificates for production/development
		if (process.env.TELLER_ENVIRONMENT !== 'sandbox') {
			this._httpsAgent = new https.Agent({
				cert: fs.readFileSync(process.env.TELLER_CERT_PATH!),
				key: fs.readFileSync(process.env.TELLER_PRIVATE_KEY_PATH!),
			});
		}
	}

	private async makeRequest<T>(endpoint: string, method = 'GET', data?: any) {
		try {
			const url = `${this._baseURL}${endpoint}`;
			const headers = {
				'Teller-Version': '2020-10-12',
				'User-Agent': 'YourApp/1.0.0',
				Authorization: `Basic ${Buffer.from(`${this._accessToken}:`).toString(
					'base64'
				)}`,
			};

			const options: RequestInit = {
				method,
				headers,
				// Only add body for non-GET requests with data
				...(data && method !== 'GET' && { body: JSON.stringify(data) }),
				// Add agent for mTLS if available
				...(this._httpsAgent && { agent: this._httpsAgent }),
			};

			const response = await fetch(url, options);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return (await response.json()) as T;
		} catch (error) {
			throw new Error(
				`Teller API error: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`
			);
		}
	}

	public async getAccounts(): Promise<TellerAccountResponse[]> {
		return this.makeRequest<TellerAccountResponse[]>('/accounts');
	}

	public async getAccount(accountId: string): Promise<TellerAccountResponse> {
		return this.makeRequest<TellerAccountResponse>(`/accounts/${accountId}`);
	}

	public async deleteAccount(accountId: string): Promise<unknown> {
		return this.makeRequest<unknown>(`/accounts/${accountId}`, 'DELETE');
	}

	public async getTransactions(
		accountId: string,
		params: Record<string, any> = {}
	): Promise<TellerTransactionResponse> {
		const queryString = new URLSearchParams(params).toString();
		const endpoint = `/accounts/${accountId}/transactions${
			queryString ? `?${queryString}` : ''
		}`;
		return this.makeRequest<TellerTransactionResponse>(endpoint);
	}

	public async getBalances(accountId: string): Promise<TellerBalanceResponse> {
		return this.makeRequest<TellerBalanceResponse>(
			`/accounts/${accountId}/balances`
		);
	}
}
