import { db } from '..';
import { budgetTable, transactionTable } from '../schema';
import { categoryTable } from '../schema/category.schema';
import { userTable } from '../schema/user.schema';
import { budgetData, categoryData, transactionData, userData } from './data';

async function main() {
  try {
    await db.delete(transactionTable);
    await db.delete(categoryTable);
    await db.delete(userTable);
    await db.delete(budgetTable);

    await db.insert(budgetTable).values(budgetData);
    await db.insert(userTable).values(userData);
    await db.insert(categoryTable).values(categoryData);
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
