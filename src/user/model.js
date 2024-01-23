import mongoose from 'mongoose';

// Define the model
const Schema = new mongoose.Schema({
  name: String,
  fingerprint: String,
}, { timestamps: true });

export default mongoose.model('User', Schema);
