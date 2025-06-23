import { readFileSync } from 'fs';
import { join } from 'path';

function readSchemaFile(fileName: string): string {
	const filePath = join(__dirname, fileName);
	return readFileSync(filePath, 'utf-8');
}

export default readSchemaFile;
