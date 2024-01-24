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

export default {
  login
};
