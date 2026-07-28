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
