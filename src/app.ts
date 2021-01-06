import express from 'express';
import morgan from 'morgan';
import { RegisterRoutes } from './routes';

const app = express();

app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
RegisterRoutes(app);

app.set('port', process.env.PORT || 3000);

export default app;
