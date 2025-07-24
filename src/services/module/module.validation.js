import Joi from 'joi';


const register = {
  body: Joi.object().keys({
    moduleUUID: Joi.string().required(),
    moduleContent: Joi.object().required()
  })
};

const getModule = {
  query: Joi.object().keys({
    moduleUUID: Joi.string().required(),
    language: Joi.string().required().min(2).alphanum(),
    useId: Joi.string().alphanum(),
  })
};

const getStudentModule = {
  query: Joi.object().keys({
    userId: Joi.string().required(),
    moduleUUID: Joi.string().required(),
    language: Joi.string().required().min(2).alphanum(),
    userId: Joi.string().alphanum(),
  })
};

export default {
  register,
  getModule,
  getStudentModule
};
