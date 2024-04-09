/* eslint-disable func-names */
/* eslint-disable consistent-return */
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import config from '../../config';
import constants from '../../constants';

const {
  USER, USER_ROLE, LOCKED, UNLOCKED
} = constants;

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
  },
  roles: {
    type: String,
    enum: USER_ROLE,
    default: USER
  },
  modules: {
    type: Object,
    default: {
      '00': UNLOCKED,
      '01': LOCKED,
      '02': LOCKED,
      '03': LOCKED,
      '04': LOCKED,
      '05': LOCKED,
      '06': LOCKED
    }
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

/**
 * user model schema methods configuration
 * intended to compare inputted and saved password
 */
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return cb(err);

    cb(null, isMatch);
  });
};

export default mongoose.model('User', UserSchema);
