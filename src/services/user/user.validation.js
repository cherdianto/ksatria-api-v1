import Joi from 'joi';

/**
 * validator for get user
 * @constant
 */
const get = {
  body: Joi.object().keys({
    _id: Joi.string(),
    username:
      Joi.string()
        .min(8)
        .max(100)
        .alphanum(),
    fullname:
      Joi.string()
        .min(2)
        .max(100),
    roles:
      Joi.string()
        .min(2)
        .max(100)
  })
};

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
        .max(100)
        .alphanum(),
    fullname:
      Joi.string()
        .required()
        .min(2)
        .max(100),
    password: Joi.string().required(),
    // counselorId: Joi.string()
  })
};

/**
 * validator for update student modules based on id
 * @constant
 */
const updateModules = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    moduleUUID: Joi.string().required(),
    moduleStatus: Joi.number().required()
  })
};

/**
 * validator for update student counselor based on id
 * @constant
 */
const updateCounselor = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    counselorId: Joi.string().required()
  })
};

export default {
  get,
  register,
  updateModules,
  updateCounselor
};
