import schema from '@/interfaces/schema';
import resolvers from '@/interfaces/resolvers';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';

interface IContext {
	req: Request;
}

const server = new ApolloServer({
	typeDefs: schema,
	resolvers,
});

await server.start();

export default expressMiddleware(server);
