import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import postureRoutes from './routes/postureRoutes.js';
import connectDB from './db/db.js';
import  UserRoute from './routes/UserRoute.js'
const app = express();
const PORT = process.env.PORT || 3000;

connectDB();
app.use(cors());
app.use(bodyParser.json());



// connectDB()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`Server is running on port .................... ${PORT}`);
//     });

//     // console.log("Database connected successfully");
//   })
//   .catch((error) => {
//     console.error("Database connection failed:", error);
//     process.exit(1);
//   });

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/users', userRoute);

app.use('/api', postureRoutes);
app.use('/api/auth',UserRoute)
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});


connectDB();
export default app;
