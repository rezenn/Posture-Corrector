import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/posture', (req, res) => {
  const postureData = req.body;
  console.log('📥 Received posture data:', postureData);
  res.send({ status: 'received', data: postureData });
});



import { generateOTP } from './utils/generateOTP.js';

app.use(cors());
app.use(express.json()); // ✅ this one is very important


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
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/users', UserRoute);

app.use('/api', postureRoutes);
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
export default app; 

