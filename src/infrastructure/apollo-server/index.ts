import resolvers from '@/resolvers';
import schema from '@/schema';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

await server.start();

export default expressMiddleware(server);
