import { readFile } from 'fs/promises';
import path from 'path';

const schemaToText = async (filePath: string): Promise<string> => {
	try {
		const absolutePath = path.resolve(filePath);
		const typeDefs = await readFile(absolutePath, 'utf-8');

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
