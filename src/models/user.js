import { Schema, model } from 'mongoose';

// Створення схеми користувача для MongoDB за допомогою Mongoose
const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, //email повинен бути унікальним для кожного користувача
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
  },
  {
    timestamps: true, // автоматичне додавання полів createdAt та updatedAt
  },
);

//----------------------------------------------------

// Перед збереженням користувача перевіряємо, чи є username. Якщо його немає, встановлюємо username рівним email
userSchema.pre('save', function () {
  if (!this.username) {
    this.username = this.email;
  }
});

// перед поверненням об'єкта користувача видаляємо поле password, щоб не передавати його клієнту
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password; // видаляємо поле password з об'єкта користувача перед поверненням
  return obj;
};

export const User = model('User', userSchema);
