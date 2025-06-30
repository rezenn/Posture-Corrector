import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import postureRoutes from './routes/postureRoutes.js';
import connectDB from './db/db.js';

const app = express();
const port = 5000;

connectDB();
app.use(cors());
app.use(bodyParser.json());

app.use('/api', postureRoutes);

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
