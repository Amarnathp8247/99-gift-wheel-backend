import express, { json } from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import errorHandler from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(json());

app.use('/api/v1', routes);

app.use(errorHandler);

export default app;
