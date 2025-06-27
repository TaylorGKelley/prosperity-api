import path from 'node:path';
import schemaToText from '@/application/utils/schemaToText';

const transactionSchema = schemaToText(
	path.join(__dirname, 'transaction.schema.graphql')
);

export default [transactionSchema].join('\n\n');
