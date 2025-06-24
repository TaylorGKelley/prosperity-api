import express from 'express';
import { ApolloServer } from '@apollo/server';
import {
	expressMiddleware,
	ExpressContextFunctionArgument,
} from '@apollo/server/express4';
import resolvers from './resolvers';
import schema from './schema';

const app = express();

(async () => {
	const server = new ApolloServer({
		typeDefs: schema,
		resolvers,
	});
	await server.start();

	app.use(
		'/api/v1',
		express.json(),
		expressMiddleware(server, {
			context: async ({ req }: ExpressContextFunctionArgument) => ({ req }),
		})
	);
})();

export default app;
