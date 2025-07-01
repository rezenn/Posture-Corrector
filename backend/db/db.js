// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  console.log(` Mongoose connected to: ${mongoose.connection.name}`);
  } catch (err) {
    console.error(' DB Error:', err.message);
    process.exit(1); // Exit on failure
  }
};


export default connectDB;
