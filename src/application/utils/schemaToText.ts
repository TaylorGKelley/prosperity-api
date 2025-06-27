import { readFileSync } from 'node:fs';
import path from 'path';

const schemaToText = (filePath: string): string => {
	try {
		const absolutePath = path.resolve(filePath);
		const typeDefs = readFileSync(absolutePath, 'utf-8');

		return typeDefs;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Error reading schema file: ${error.message}`);
		} else {
			throw new Error(
				'An unknown error occurred while reading the schema file.'
			);
		}
	}
};

export default schemaToText;
