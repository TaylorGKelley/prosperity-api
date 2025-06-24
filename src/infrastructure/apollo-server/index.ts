import { type Request } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import schema from '@/interfaces/schema';
import resolvers from '@/interfaces/resolvers';

interface IContext {
	req: Request;
}

const server = new ApolloServer<IContext>({
	typeDefs: schema,
	resolvers,
});

await server.start();

export default expressMiddleware(server, {
	context: async ({ req }) => ({ req }),
});
