/* eslint-disable */

import { UNAUTHORIZED } from 'http-status-codes';
import Joi from 'joi';

/**
 * validator for login api
 * @constant
 */
const login = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().required().min(8).max(50).alphanum(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details.map((detail) => detail.message).join(', '),
    });
  }

  next();
};

const generateResetPasswordLink = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const validateResetPasswordLink = {
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const changePasswordWithToken = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    newPassword: Joi.string().required(),
  }),
};

const changeUserPassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
  }),
};

export default {
  login,
  generateResetPasswordLink,
  validateResetPasswordLink,
  changePasswordWithToken,
  changeUserPassword,
};
