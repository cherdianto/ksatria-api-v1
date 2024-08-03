/* eslint-disable func-names */
/* eslint-disable consistent-return */
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import config from '../../config';
import constants from '../../constants';

const {
  USER, USER_ROLE, USER_STATUS, ACTIVE, LOCKED, UNLOCKED
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
  fullname: {
    type: String,
    required: true,
    max: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  whatsapp: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  faculty: {
    type: String,
  },
  personalization: Object,
  roles: {
    type: String,
    enum: USER_ROLE,
    default: USER
  },
  roles: {
    type: String,
    enum: USER_STATUS,
    default: ACTIVE
  },
  counselorId: {
    type: mongoose.ObjectId
  },
  modules: {
    type: Object,
    default: {
      MI: {
        0: UNLOCKED,
        1: LOCKED,
        2: LOCKED,
        3: LOCKED,
        4: LOCKED,
        5: LOCKED,
        6: LOCKED
      },
      MA: {
        1: LOCKED,
        2: LOCKED,
        3: LOCKED,
        4: LOCKED,
        5: LOCKED,
        6: LOCKED
      }
    }
  }
}, { timestamps: true },
{ versionKey: false });

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
