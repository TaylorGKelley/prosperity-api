import { gql } from 'graphql-tag';
import typeDefs from './typeDefs';
import scalarTypes from './scalarTypes';
import enums from './enums';

const schema = gql`
	${typeDefs}
	${scalarTypes}
	${enums}
`;

export default schema;
