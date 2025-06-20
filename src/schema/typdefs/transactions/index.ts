import { readFileSync } from 'fs';
import { join } from 'path';

const typeDefs = readFileSync(
	join(__dirname, 'transaction.graphql')
).toString();

const schemaDef = {
	typeDefs,
};

export default schemaDef;
