import express from 'express';
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

