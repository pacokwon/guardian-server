import express from 'express';
import morgan from 'morgan';
import apiRoute from './routes';

const app = express();

app.use(morgan('combined'));
app.use(express.json());
app.use('/api', apiRoute);

app.set('port', process.env.PORT || 3000);

export default app;
