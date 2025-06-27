import express from 'express';
import apolloServerMiddleware from './infrastructure/apollo-server';

const app = express();

app.use(express.json());
app.use('/api/v1/graphql', apolloServerMiddleware);

export default app;
