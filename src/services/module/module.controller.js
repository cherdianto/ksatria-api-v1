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
  const { moduleUUID, moduleContent } = req.body;
  const newModule = new ModuleModel({ moduleUUID, moduleContent });

  newModule.save()
    .then(() => {
      res.status(CREATED).send(
        formatResponse(`Successfully register module: ${moduleUUID}`, true)
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
  const { moduleUUID, language } = req.body;

  ModuleModel.findOne({ moduleUUID })
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
          moduleUUID: module.moduleUUID,
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
