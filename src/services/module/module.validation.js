import Joi from 'joi';

/**
 * validator for register new module api
 * @constant
 */
const register = {
  body: Joi.object().keys({
    moduleUUID: Joi.number().required(),
    moduleContent: Joi.object().required()
  })
};

/**
 * validator for get modules based on id
 * @constant
 */
const getModule = {
  body: Joi.object().keys({
    moduleUUID: Joi.number().required(),
    language: Joi.string().required().min(2).alphanum()
  })
};

export default {
  register,
  getModule
};
