import 'dotenv/config';
import { startServer } from './infrastructure/apollo';
import resolvers from './interfaces/resolvers';
import schema from './interfaces/schema';

const port: number = parseInt(process.env.PORT!) || 4000;

startServer(schema, resolvers, port);
