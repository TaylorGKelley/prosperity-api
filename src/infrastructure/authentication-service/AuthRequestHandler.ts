import { IncomingMessage } from 'node:http';
import { RESTDataSource } from '@apollo/datasource-rest';

type ErrorResponse = {
	message?: string;
	stack?: string;
};

type User = {
	id: number;
	email: string;
};

type GetUserPermissionsResponse = ErrorResponse & {
	user: User;
	permissions: Record<string, string[]>;
};

export default class AuthRequestHandler extends RESTDataSource {
	baseURL: string = process.env.AUTH_SERVICE_URL!;
	linkedServiceId: string = process.env.AUTH_SERVICE_LINKED_SERVICE_ID!;
	req: IncomingMessage;

	constructor(req: IncomingMessage) {
		super();
		this.req = req; // for obtaining the request headers
	}

	async getUserPermissions() {
		return await this.get<GetUserPermissionsResponse>(
			`/api/v1/user-permissions/${this.linkedServiceId}`,
			{
				headers: {
					Authorization: this.req.headers.authorization || '',
				},
			}
		);
	}
}
