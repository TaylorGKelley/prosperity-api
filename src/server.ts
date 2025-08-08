import 'dotenv/config';
// import { startServer } from './infrastructure/apollo/standalone';
import resolvers from '@/interfaces/resolvers';
import schema from './interfaces/schema';
import express from 'express';
import { startMiddlewareServer } from './infrastructure/apollo';
import { webhook } from './interfaces/controllers/webhook.controller';

const port: number = parseInt(process.env.PORT!) || 4000;

const app = express();

app.use(express.json());

app.post('/webhook', webhook);

app.use('/', startMiddlewareServer(schema, resolvers));

// startServer(schema, resolvers, port);

app.listen(port, () => {
  console.log(`🚀 Server Started on port ${port}`);
});
