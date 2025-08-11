import { type CodegenConfig } from '@graphql-codegen/cli';
import { type UUID } from 'node:crypto';

const config: CodegenConfig = {
  overwrite: true,
  schema: './src/interfaces/schema',
  generates: {
    'src/types/schema.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        scalars: {
          ID: "import('node:crypto').UUID",
          Date: 'Date',
          DateTime: 'Date',
        },
        preResolveTypes: true,
      },
    },
  },
};

export default config;
