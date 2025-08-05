import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const initializeDatabase = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });

  const db = drizzle({ client: pool, schema });

  // Optionally test the connection
  pool
    .query('SELECT 1')
    .then(() => {
      console.log('🔌 Database connection established successfully.');
    })
    .catch((err: Error) => {
      console.error('🛑 Database connection test failed:', err.message);
      throw new Error('Failed to connect to the database.');
    });

  return db;
};

export const db = initializeDatabase();
