import express from 'express';
import './config/firebase'; // Eagerly initialize Firebase Admin SDK at startup
import userRoutes from './routes/userRoutes';
import accountRoutes from './routes/accountRoutes';
import transactionRoutes from './routes/transactionRoutes';
import ledgerRoutes from './routes/ledgerRoutes';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Banking System Server is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ledger', ledgerRoutes);

export default app;