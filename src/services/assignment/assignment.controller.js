import { StatusCodes } from 'http-status-codes';

import { UserController } from '../user';
import { formatResponse } from '../../util';
import constants from '../../constants';

import AssignmentModel from './assignment.model';

const {
  OK, CREATED, NOT_FOUND, INTERNAL_SERVER_ERROR
} = StatusCodes;

const { IN_PROGRESS, FINISHED, INTRO_MODULE } = constants;

/**
 * updateIntro
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling update intro status
 */
const updateIntro = (req, res) => UserController
  .updateUserData(req?.userId, { [`modules.${INTRO_MODULE}`]: FINISHED })
  .then(() => res.status(OK).send(
    formatResponse('Successfully update tutorial status', true)
  ))
  .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false)));

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
    .then((assignment) => res.status(CREATED).send(
      formatResponse('Successfully save assignment', true, undefined, {
        currentProgress: assignment.currentProgress,
        totalProgress: assignment.totalProgress,
        saveData: assignment.saveData,
        progress: assignment.progress
      })
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

/**
 * getSaveData
 *
 * @param {string} userId - user Id
 * @param {string} moduleId - module Id
 * @returns get save data for spesific user and module
 */
const getSaveData = (userId, moduleId) => AssignmentModel
  .findOne({ userId, moduleId }).exec();

export default {
  updateIntro,
  save,
  load,
  getSaveData
};
