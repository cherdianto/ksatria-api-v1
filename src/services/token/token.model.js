import mongoose from 'mongoose';

/**
 * token model schema definition
 */
const TokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    token: {
      type: String,
      required: true
    },
    expiryAt: {
      type: Number,
      required: true
    }
  },
  { timestamps: true },
  { versionKey: false }
);

export default mongoose.model('Token', TokenSchema);
