import express from 'express';
import cors from 'cors';
import planetRoutes from './routes/planet.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/planets', planetRoutes);
app.use(errorHandler);

export default app;