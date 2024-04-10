import { StatusCodes } from 'http-status-codes';

import ModuleModel from './module.model';
import { formatResponse } from '../../util';

const {
  OK, CREATED, NOT_FOUND, INTERNAL_SERVER_ERROR
} = StatusCodes;

/**
 * create new module
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to register new module
 */
const create = (req, res) => {
  const { moduleId, moduleContent } = req.body;
  const newModule = new ModuleModel({ moduleId, moduleContent });

  newModule.save()
    .then(() => {
      res.status(CREATED).send(
        formatResponse(`Successfully register module: ${moduleId}`, true)
      );
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
    });
};

/**
 * get spesicfic module
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to get specific module
 */
const get = (req, res) => {
  const { moduleId, language } = req.body;

  ModuleModel.findOne({ moduleId })
    .then((module) => {
      // handle module not found
      if (!module) {
        return res.status(NOT_FOUND).send(
          formatResponse('Module doesn\'t exist', true, NOT_FOUND)
        );
      }

      return res.status(OK).send(
        formatResponse('Successfully retrieve module', true, undefined, {
          id: module._id,
          moduleId: module.moduleId,
          contents: module.moduleContent[language] || {}
        })
      );
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
    });
};

export default {
  create,
  get
};
