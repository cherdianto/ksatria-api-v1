import Joi from 'joi';

/**
 * validator for register api
 * @constant
 */
const register = {
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

export default {
  register
};
