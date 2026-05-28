import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import notesRoutes from './routes/notesRoutes.js';

const app = express(); // утворюємо  Express-додатокr

const PORT = process.env.PORT ?? 3000; // визначаємо порт, на якому буде працювати сервер

app.use(logger); // додаємо middleware для логування HTTP-запитів
app.use(express.json()); // вбудований middleware для парсингу JSON-тіла запитів
app.use(cors()); // додаємо middleware для дозволу CORS

app.use(notesRoutes); // підключаємо маршрути для нотаток
app.use(notFoundHandler); // middleware для обробки невідомих маршрутів
app.use(errorHandler); // middleware для обробки помилок

// Підключаємося до MongoDB
await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
