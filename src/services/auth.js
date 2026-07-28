import crypto from 'node:crypto';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js'; // імпортуємо константи часу з файлу time.js
import { Session } from '../models/session.js';

// Функція для створення нової сесії користувача
export const createSession = async (userId) => {
  const accessToken = crypto.randomUUID();
  const refreshToken = crypto.randomUUID();

  return Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
};

// Функція для встановлення кукі сесії користувача
export const setSessionCookies = (res, session) => {

  // Встановлюємо кукі для accessToken, refreshToken та sessionId з відповідними параметрами безпеки
  res.cookie('accessToken', session.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: FIFTEEN_MINUTES, // час життя кукі (15 хвилин)
  });

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: ONE_DAY,
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    secure: true, 
    sameSite: 'none', //  кукі доступна для всіх сайтів, включаючи сторонні
    maxAge: ONE_DAY, // час життя кукі (1 день)
  });
};

