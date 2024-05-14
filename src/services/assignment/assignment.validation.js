import Joi from 'joi';

/**
 * validator for get modules based on id
 * @constant
 */
const get = {
  query: Joi.object().keys({
    moduleUUID: Joi.string().required(),
    assignmentId: Joi.alternatives().try(Joi.array().required().items(Joi.string()), Joi.string())
  })
};

/**
 * validator for save data api
 * @constant
 */
const save = {
  body: Joi.object().keys({
    moduleId: Joi.string().hex().length(24).required(),
    moduleUUID: Joi.string().required(),
    currentProgress: Joi.number().required(),
    totalProgress: Joi.number().required(),
    saveData: Joi.object().required().pattern(
      Joi.string(),
      Joi.object().keys({
        assignmentId: Joi.string().required().min(2),
        question: Joi.any().required(),
        answer: Joi.any().required()
      })
    )
  })
};

/**
 * validator for load save data api
 * @constant
 */
const load = {
  body: Joi.object().keys({
    moduleId: Joi.string().hex().length(24).required()
  })
};

export default {
  get,
  load,
  save
};
