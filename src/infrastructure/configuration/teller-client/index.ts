import https from 'https';
import fs from 'fs';
import { type UUID } from 'node:crypto';

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

	private async makeRequest(endpoint: string, method = 'GET', data?: any) {
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

			return response.json();
		} catch (error) {
			throw new Error(
				`Teller API error: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`
			);
		}
	}

	public async getAccounts() {
		return this.makeRequest('/accounts');
	}

	public async getAccount(accountId: UUID) {
		return this.makeRequest(`/accounts/${accountId}`);
	}

	public async getTransactions(
		accountId: UUID,
		params: Record<string, any> = {}
	) {
		const queryString = new URLSearchParams(params).toString();
		const endpoint = `/accounts/${accountId}/transactions${
			queryString ? `?${queryString}` : ''
		}`;
		return this.makeRequest(endpoint);
	}

	public async getBalances(accountId: UUID) {
		return this.makeRequest(`/accounts/${accountId}/balances`);
	}
}
