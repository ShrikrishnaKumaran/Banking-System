import express from 'express';
import './config/firebase'; // Eagerly initialize Firebase Admin SDK at startup

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Banking System Server is running' });
});

export default app;