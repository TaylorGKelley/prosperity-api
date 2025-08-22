import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeExecutableSchema } from '@graphql-tools/schema';
import directiveTransformer, {
  directiveTypeDefs as authDirectiveTypeDefs,
} from '@/interfaces/directives/index.directives';
import AuthRequestHandler from '../authentication-service/AuthRequestHandler';
import { type IResolvers } from '@graphql-tools/utils';
import { type IncomingMessage, type ServerResponse } from 'http';
import { type DocumentNode } from 'graphql';
import { User } from '@/types/User';
import { expressMiddleware } from '@as-integrations/express5';
import { Request, RequestHandler, Response } from 'express';

type ContextType = {
  req: Request & {
    user: User | null;
  };
  res: Response;
  authRequestHandler: AuthRequestHandler;
};

function startMiddlewareServer(
  schema: DocumentNode,
  resolvers: IResolvers
): RequestHandler {
  return async (req, res, next) => {
    let execSchema = makeExecutableSchema({
      typeDefs: [authDirectiveTypeDefs, schema],
      resolvers,
    });

    execSchema = directiveTransformer(execSchema);

    const server = new ApolloServer<ContextType>({
      schema: execSchema,
    });

    await server.start();

    return expressMiddleware(server, {
      context: async ({ req, res }) => {
        const authRequestHandler = new AuthRequestHandler(req);

        return {
          req: { ...req, user: null } as ContextType['req'],
          res,
          authRequestHandler,
        };
      },
    })(req, res, next);
  };
}

export { startMiddlewareServer, type ContextType };
