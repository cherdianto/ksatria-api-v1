import Joi from 'joi';

/**
 * validator for register new module api
 * @constant
 */
const register = {
  body: Joi.object().keys({
    moduleUUID: Joi.string().required(),
    moduleContent: Joi.object().required()
  })
};

/**
 * validator for get modules based on id
 * @constant
 */
const getModule = {
  query: Joi.object().keys({
    moduleUUID: Joi.string().required(),
    language: Joi.string().required().min(2).alphanum()
  })
};

/**
 * validator for get modules based on user id
 * @constant
 */
const getStudentModule = {
  query: Joi.object().keys({
    userId: Joi.string().required(),
    moduleUUID: Joi.string().required(),
    language: Joi.string().required().min(2).alphanum()
  })
};

export default {
  register,
  getModule,
  getStudentModule
};
