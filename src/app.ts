import express from 'express';
import './config/firebase'; // Eagerly initialize Firebase Admin SDK at startup
import userRoutes from './routes/userRoutes';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Banking System Server is running' });
});

app.use('/api/users', userRoutes);

export default app;