import express from 'express';
import cors, { CorsRequest } from 'cors';
import apolloServer from './infrastructure/apollo-server';

const app = express();

app.use(cors<CorsRequest>());
app.use(express.json());

app.use('/api/v1/graphql', apolloServer);

export default app;
