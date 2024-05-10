import { StatusCodes } from 'http-status-codes';

import ModuleModel from './module.model';
import { formatResponse } from '../../util';
import assignmentController from '../assignment/assignment.controller';

const {
  OK, CREATED, NOT_FOUND, INTERNAL_SERVER_ERROR
} = StatusCodes;

/**
 * create or update existing module
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to register new module
 */
const create = (req, res) => {
  const { moduleUUID, moduleContent } = req.body;
  const newModule = { moduleUUID, moduleContent };

  ModuleModel.findOneAndUpdate({ moduleUUID }, newModule, { new: true, upsert: true })
    .then(() => {
      res.status(CREATED).send(
        formatResponse(`Successfully register module ${moduleUUID}`, true)
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
  const { moduleUUID, language } = req.query;

  ModuleModel.findOne({ moduleUUID })
    .then(async (module) => {
      // handle module not found
      if (!module) {
        return res.status(NOT_FOUND).send(
          formatResponse('Module doesn\'t exist', true, NOT_FOUND)
        );
      }

      const _loadSaveData = await assignmentController.getSaveData(req.userId, module._id);
      let mappedSaveData = null;

      // attach user save data
      if (_loadSaveData) {
        const {
          currentProgress, totalProgress, saveData, progress
        } = _loadSaveData;

        mappedSaveData = {
          currentProgress,
          totalProgress,
          progress,
          saveData
        };
      }

      return res.status(OK).send(
        formatResponse('Successfully retrieve module', true, undefined, {
          id: module._id,
          moduleUUID: module.moduleUUID,
          contents: module.moduleContent[language] || {},
          progress: mappedSaveData || {}
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
