import express, { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { RegisterRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { schema } from './graphql/schema';

const app = express();
const apolloServer = new ApolloServer({ schema });

app.use(morgan('combined'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// register auto generated routes
RegisterRoutes(app);

// server swagger docs
app.use('/docs', swaggerUi.serve, async (_: Request, res: Response) => {
    res.send(swaggerUi.generateHTML(await import('../docs/swagger.json')));
});

// custom error handler
app.use(errorHandler);

apolloServer.applyMiddleware({ app });

app.set('port', process.env.PORT || 3000);

export default app;
