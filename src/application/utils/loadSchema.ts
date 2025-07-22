import { globSync } from 'glob';
import fs from 'node:fs';

function loadSchema(...patterns: string[]) {
  const matches = globSync(patterns);

  const schemas = [];
  for (const path of matches) {
    schemas.push(
      fs.readFileSync(path, {
        encoding: 'utf-8',
      })
    );
  }

  return schemas.join('\n\n');
}

export default loadSchema;
