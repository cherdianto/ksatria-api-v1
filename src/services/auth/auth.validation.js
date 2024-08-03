/* eslint-disable */

import Joi from 'joi';

/**
 * validator for login api
 * @constant
 */
const login = {
  body: Joi.object().keys({
    username:
    Joi.string()
      .required()
      .min(8)
      .max(50)
      .alphanum(),
    password: Joi.string().required()
  })
};

const generateResetPasswordLink = {
  body: Joi.object().keys({
    email: Joi.string().email().required()
  })
};

const validateResetPasswordLink = {
  body: Joi.object().keys({
    token: Joi.string()
    .required()
  })
};

const changePasswordWithToken = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    newPassword: Joi.string().required()
  })
};

export default {
  login,
  generateResetPasswordLink,
  validateResetPasswordLink,
  changePasswordWithToken
};
