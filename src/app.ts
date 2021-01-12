import 'dotenv/config';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { RegisterRoutes } from './routes';
import { errorHandler } from '@/middleware/errorHandler';

const app = express();

app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

RegisterRoutes(app);

app.use('/docs', swaggerUi.serve, async (_: Request, res: Response) => {
    res.send(swaggerUi.generateHTML(await import('../docs/swagger.json')));
});
app.use(errorHandler);

app.set('port', process.env.PORT || 3000);

export default app;
