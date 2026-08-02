import { User } from '../models/user.js';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { createSession, setSessionCookies } from '../services/auth.js';
import { Session } from '../models/session.js';

import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import { sendEmail } from '../utils/sendMail.js';

//1. Створюємо контролер для обробки запиту на реєстрацію користувача
export const registerUser = async (req, res) => {
  // Отримання даних з тіла запиту (email та password)
  const { email, password } = req.body;

  // Перевіряємо, чи користувач з таким email вже існує
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError(400, 'Email in use');
  }

  // Хешуємо пароль користувача перед збереженням у базі даних
  const hashedPassword = await bcrypt.hash(password, 10);

  // Створюємо нового користувача у базі даних
  const user = await User.create({
    email,
    password: hashedPassword,
  });

  // Створюємо сесію для нового користувача
  const session = await createSession(user._id);

  // Встановлюємо кукі для сесії користувача
  setSessionCookies(res, session);

  // Повертаємо відповідь з даними нового користувача
  res.status(201).json(user);
};

//2. Створюємо контролер для обробки запиту на вхід користувача
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Знаходимо користувача за email
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }

  // Перевіряємо, чи введений пароль відповідає збереженому хешованому паролю
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid credentials');
  }

  await Session.deleteOne({ userId: user._id });

  // Створюємо сесію для користувача
  const session = await createSession(user._id);

  // Встановлюємо кукі для сесії користувача
  setSessionCookies(res, session);

  // Повертаємо відповідь з даними користувача
  res.status(200).json(user);
};

//3. Створюємо контролер оновлення токенів доступу та оновлення
export const refreshUserSession = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies; // отримуємо sessionId та refreshToken з кукі

  if (!sessionId || !refreshToken) {
    throw createHttpError(401, 'Session not found');
  }

  // Знаходимо сесію користувача за sessionId та refreshToken
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired = session.refreshTokenValidUntil < new Date();

  if (isSessionTokenExpired) {
    await Session.deleteOne({ _id: session._id });

    res.clearCookie('sessionId');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    throw createHttpError(401, 'Session token expired');
  }

  await Session.deleteOne({ _id: session._id });

  const newSession = await createSession(session.userId);

  setSessionCookies(res, newSession);

  res.status(200).json({
    message: 'Session refreshed',
  });
};

//4. Створюємо контролер для обробки запиту на вихід користувача
export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies; // отримуємо sessionId з кукі

  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

//5. Створюємо контролер для обробки запиту на скидання пароля
export const requestResetEmail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({
      message: 'Password reset email sent successfully',
    });
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    },
  );

  const templatePath = path.resolve('src/templates/reset-password-email.html');

  const templateSource = await fs.readFile(templatePath, 'utf-8');

  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.username,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  return res.status(200).json({
    message: 'Password reset email sent successfully',
  });
};

// Встановлення нового пароля за JWT-токеном
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  // Перевіряємо справжність токена та строк його дії
  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }

  // Шукаємо користувача за даними, записаними в токені
  const user = await User.findOne({
    _id: payload.sub,
    email: payload.email,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  // Хешуємо та зберігаємо новий пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.updateOne({ _id: user._id }, { password: hashedPassword });

  // Видаляємо старі сесії користувача
  await Session.deleteMany({ userId: user._id });

  res.status(200).json({
    message: 'Password reset successfully',
  });
};
