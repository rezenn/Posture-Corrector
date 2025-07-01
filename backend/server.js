import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import postureRoutes from './routes/postureRoutes.js';
import connectDB from './db/db.js';
import  UserRoute from './routes/UserRoute.js'
const app = express();
const port = 5000;

connectDB();
app.use(cors());
app.use(bodyParser.json());

app.use('/api', postureRoutes);
app.use('/api/auth',UserRoute)
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
