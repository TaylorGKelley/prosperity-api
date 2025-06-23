import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import schema from './schema';

const app = express();

const graphHandler = createHandler({
	schema,
	// context: (req) => ({
	//     ip: req.raw.ip,
	// })
});

app.use('/api/v1', graphHandler);

export default app;
