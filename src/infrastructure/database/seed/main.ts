import { db } from '..';
import { transactionTable } from '../schema';
import { transactionData } from './data';

async function main() {
  try {
    await db.delete(transactionTable);

    await db.insert(transactionTable).values(transactionData);

    console.log('Seed data inserted successfully');
    process.exit(0);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
    else console.error(error);
    process.exit(1);
  }
}

main();
