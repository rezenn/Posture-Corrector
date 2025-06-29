import express from 'express';
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
