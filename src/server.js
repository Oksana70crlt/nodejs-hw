import express from 'express';
import 'dotenv/config';

const app = express();

const PORT = process.env.PORT ?? 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Server is running',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
