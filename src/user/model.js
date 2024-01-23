/* eslint-disable func-names */
/* eslint-disable consistent-return */
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import config from '../config';

/**
 * user model schema definition
 */
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    max: 100
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

/**
 * user model schema pre save configuration
 * intended to hash the password before save it to database
 */
UserSchema.pre('save', function (next) {
  const user = this;

  if (!user.isModified('password')) next();

  bcrypt.hash(user.password, config.saltFactor, (err, hash) => {
    if (err) return next(err);

    user.password = hash;

    next();
  });
});

export default mongoose.model('User', UserSchema);
