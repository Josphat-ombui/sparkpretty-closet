import mongoose from 'mongoose';

const connectDB = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      mongoose.connection.on('error', (err) => console.error(`MongoDB runtime error: ${err.message}`));
      return conn;
    } catch (err) {
      console.error(`MongoDB connection error (attempt ${attempt}/${retries}): ${err.message}`);
      if (attempt === retries) {
        console.error('Failed to connect to MongoDB after multiple attempts.');
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

export default connectDB;