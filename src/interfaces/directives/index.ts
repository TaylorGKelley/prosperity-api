import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  defaultFieldResolver,
  GraphQLResolveInfo,
  GraphQLSchema,
} from 'graphql';
import gql from 'graphql-tag';
import { mapSchema, MapperKind, getDirective } from '@graphql-tools/utils';
import { ContextType } from '@/infrastructure/apollo';

const authDirectiveName = 'auth' as const;

const authDirectiveTypeDefs = gql(
  readFileSync(path.resolve(__dirname, './directives.graphql'), {
    encoding: 'utf-8',
  })
);

function directiveTransformer(schema: GraphQLSchema) {
  const typeDirectiveArgumentMaps: Record<string, any> = {};

  return mapSchema(schema, {
    [MapperKind.TYPE]: (type) => {
      const authDirective = getDirective(schema, type, authDirectiveName)?.[0];
      if (authDirective) {
        typeDirectiveArgumentMaps[type.name] = authDirective;
      }
      return undefined;
    },
    [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
      const authDirective =
        getDirective(schema, fieldConfig, authDirectiveName)?.[0] ??
        typeDirectiveArgumentMaps[typeName];
      if (authDirective) {
        const { permissions } = authDirective as { permissions?: string[] };
        if (permissions) {
          const { resolve = defaultFieldResolver } = fieldConfig;
          fieldConfig.resolve = async (
            source: any,
            args: any,
            context: ContextType,
            info: GraphQLResolveInfo
          ) => {
            // Fetch Permissions for user
            const response =
              await context.authRequestHandler.getUserPermissions();

            context.req.user = response.user;

            const isAllowed = permissions.some(
              (permission) =>
                permission ===
                  (process.env.AUTH_SERVICE_DEFAULT_PERMISSION as string) ||
                response.permissions[
                  context.authRequestHandler.linkedServiceId
                ]?.includes(permission)
            );

            if (!isAllowed) {
              throw new Error('Forbidden');
            }

            return resolve(source, args, context, info);
          };
          return fieldConfig;
        }
      }
    },
  });
}

export { directiveTransformer as default, authDirectiveTypeDefs };
