import dns from 'node:dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '1.1.1.1']);

export const connectMongoDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;

    await mongoose.connect(mongoUrl);

    console.log('✅ MongoDB connection established successfully');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};
