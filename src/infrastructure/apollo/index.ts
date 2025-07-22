import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeExecutableSchema } from '@graphql-tools/schema';
import directiveTransformer, {
  authDirectiveTypeDefs,
} from '@/interfaces/directives';
import AuthRequestHandler from '../authentication-service/AuthRequestHandler';
import { type IResolvers } from '@graphql-tools/utils';
import { type IncomingMessage, type ServerResponse } from 'http';
import { type DocumentNode } from 'graphql';

type ContextType = {
  req: IncomingMessage;
  res: ServerResponse;
  authRequestHandler: AuthRequestHandler;
};

function startServer(
  schema: DocumentNode,
  resolvers: IResolvers,
  port: number
) {
  async function startApolloServer() {
    let execSchema = makeExecutableSchema({
      typeDefs: [authDirectiveTypeDefs, schema],
      resolvers,
    });

    execSchema = directiveTransformer(execSchema);

    const server = new ApolloServer<ContextType>({
      schema: execSchema,
    });

    const { url } = await startStandaloneServer<ContextType>(server, {
      listen: { port },
      context: async ({ req, res }) => {
        const authRequestHandler = new AuthRequestHandler(req);

        return { req, res, authRequestHandler };
      },
    });

    console.log(`🚀 Server is running at: ${url}`);
  }

  startApolloServer().catch((error) => {
    console.error('Error starting Apollo Server:', error);
    process.exit(1);
  });
}

export { startServer, type ContextType };
