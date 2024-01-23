import Joi from 'joi';
import pick from 'lodash/pick';
import { StatusCodes } from 'http-status-codes';

import { formatResponse } from '../util';

const { BAD_REQUEST } = StatusCodes;

/**
 * validate middleware
 * @param {Object} schema - joi schema
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @param {Object} next - express next
 *
 * @returns joi validation middleware
 */
const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');

    return res.status(BAD_REQUEST).json(formatResponse(errorMessage, false, BAD_REQUEST));
  }

  Object.assign(req, value);

  return next();
};

export default validate;
