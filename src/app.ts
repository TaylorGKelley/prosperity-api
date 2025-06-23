import express from 'express';
import schema from './schema';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import resolvers from './resolvers';

const app = express();

(async () => {
	const server = new ApolloServer({
		typeDefs: schema,
		resolvers,
	});

	await server.start();

	app.use('/api/v1', express.json(), expressMiddleware(server));
})();

export default app;
