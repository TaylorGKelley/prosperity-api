import loadSchema from '@/application/utils/loadSchema';
import gql from 'graphql-tag';

const schema = gql(
  loadSchema(
    '**/schema/enums/*.enum.graphql',
    '**/schema/scalarTypes/*.scalar.graphql',
    '**/schema/typeDefs/*.typedef.graphql'
  )
);

export default schema;
