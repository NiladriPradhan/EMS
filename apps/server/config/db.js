import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
  try {
    dns.setServers(["1.1.1.1","8.8.8.8"])
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected✅');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;