import mongoose from 'mongoose';

/**
 * user model definition
 */
const Schema = new mongoose.Schema({
  name: String,
  fingerprint: String
}, { timestamps: true });

export default mongoose.model('User', Schema);
