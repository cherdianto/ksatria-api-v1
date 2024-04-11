import { StatusCodes } from 'http-status-codes';

import { UserController } from '../user';
import AssignmentModel from './assignment.model';
import { formatResponse } from '../../util';
import constants from '../../constants';

const {
  OK, CREATED, NOT_FOUND, INTERNAL_SERVER_ERROR
} = StatusCodes;

const { IN_PROGRESS, FINISHED } = constants;

/**
 * save
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling save progress data
 */
const save = (req, res) => {
  const {
    userId, body: {
      moduleId, moduleUUID, currentProgress, totalProgress, saveData
    }
  } = req;
  const newSave = {
    moduleUUID,
    currentProgress,
    totalProgress,
    saveData,
    progress: currentProgress !== totalProgress ? IN_PROGRESS : FINISHED
  };

  if (currentProgress === totalProgress) {
    UserController.updateUserData(userId, { [`modules.${moduleId}`]: FINISHED })
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false)));
  }

  AssignmentModel.findOneAndUpdate({ userId, moduleId }, newSave, { upsert: true, new: true })
    .then(() => res.status(CREATED).send(
      formatResponse('Successfully save assignment', true)
    ))
    .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false)));
};

/**
 * load
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling load progress data
 */
const load = (req, res) => {
  const { userId, body: { moduleId } } = req;

  AssignmentModel.findOne({ userId, moduleId })
    .then((assignment) => {
      // handle save data not found
      if (!assignment) {
        return res.status(NOT_FOUND).send(
          formatResponse('No save data found.', true, NOT_FOUND)
        );
      }

      const {
        currentProgress, totalProgress, saveData, progress
      } = assignment;

      return res.status(OK).send(
        formatResponse('Successfully retrieve sava data', true, undefined, {
          currentProgress, totalProgress, saveData, progress
        })
      );
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
    });
};

export default {
  save,
  load
};
