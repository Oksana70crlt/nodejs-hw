import { Joi, Segments } from 'celebrate';

// Валідація даних для реєстрації користувача
export const registerUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(), // перевірка, що поле "email" є рядком у форматі електронної пошти та є обов'язковим для заповнення
    password: Joi.string().min(8).required(), //g перевірка, що поле "password" є рядком довжиною не менше 8 символів та є обов'язковим для заповнення
  }).required(), // перевірка, що тіло запиту є обов'язковим для заповнення
};

// Валідація даних для входу користувача
export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).required(),
};

// Валідація даних для запиту на скидання пароля
export const requestResetEmailSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required(),
  }),
};

// Валідація даних для скидання пароля
export const resetPasswordSchema = {
  [Segments.BODY]: Joi.object({
    password: Joi.string().min(8).required(), // новий пароль користувача (мінімум 8 символів)
    token: Joi.string().required(), // token — підписаний JWT, який ми надіслали в листі (дійсний упродовж 15 хв).
  }),
};
