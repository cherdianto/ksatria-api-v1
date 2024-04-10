import Joi from 'joi';

/**
 * validator for register new module api
 * @constant
 */
const register = {
  body: Joi.object().keys({
    moduleId: Joi.string()
      .required()
      .min(2)
      .max(2)
      .alphanum(),
    moduleContent: Joi.object().required()
  })
};

/**
 * validator for get modules based on id
 * @constant
 */
const getModule = {
  body: Joi.object().keys({
    moduleId: Joi.string()
      .required()
      .min(2)
      .max(2)
      .alphanum(),
    language: Joi.string().required().min(2).alphanum()
  })
};

export default {
  register,
  getModule
};
