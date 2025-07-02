import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRoute from "./routes/UserRoute.js";
import connectDB from "./db/db.js";


const app = express();
const PORT = process.env.PORT || 3000;

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

app.use('/api/user', userRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port .................... ${PORT}`);
});

connectDB();
export default app;