import express from 'express';
<<<<<<< HEAD
import bodyParser from 'body-parser';
import cors from 'cors';
import router from "./routes/UserRoute";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(cors());
app.use('/api/users', router);

app.listen(PORT, () => {
  console.log(`Server is running on port .................... ${PORT}`);
});
export default app; 

=======
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/posture', (req, res) => {
  const postureData = req.body;
  console.log('📥 Received posture data:', postureData);
  res.send({ status: 'received', data: postureData });
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
>>>>>>> ac6c390fa7a1911365dfe10f685d79102dc6e58c
