import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import 'dotenv/config';

const app = express(); // утворюємо  Express-додатокr

const PORT = process.env.PORT ?? 3000; // визначаємо порт, на якому буде працювати сервер

app.use(express.json()); // вбудований middleware для парсингу JSON-тіла запитів

app.use(cors()); // додаємо middleware для дозволу CORS

app.use(
  // додаємо middleware для логування HTTP-запитів
  pino({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat:
          '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
        hideObject: true,
      },
    },
  }),
);

// Визначаємо маршрути для обробки запитів
app.get('/notes', (req, res) => {
  res.status(200).json({
    message: 'Retrieved all notes',
  });
});

app.get('/notes/:notesId', (req, res) => {
  const { notesId } = req.params;
  res.status(200).json({
    message: `Retrieved note with ID: ${notesId}`,
  });
});

// Додатковий маршрут для тестування обробки помилок
app.get('/test-error', () => {
  throw new Error('Simulated server error');
});

// Обробник для невизначених маршрутів (404 Not Found)
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
