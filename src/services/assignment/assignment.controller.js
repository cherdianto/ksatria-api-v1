import { StatusCodes } from 'http-status-codes';

import { UserController } from '../user';
import { formatResponse } from '../../util';
import constants from '../../constants';

import AssignmentModel from './assignment.model';

const {
  OK, CREATED, NOT_FOUND, INTERNAL_SERVER_ERROR
} = StatusCodes;

const {
  UNLOCKED,
  IN_PROGRESS,
  FINISHED,
  INTERVENTION_MODULE,
  ASSIGNMENT_MODULE,
  MODULE_SEPARATOR
} = constants;

/**
 * get
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling get assignment based on id
 */
const get = (req, res) => {
  const { userId, query: { moduleUUID, assignmentId } } = req;

  AssignmentModel.findOne({ userId, moduleUUID })
    .then((assignment) => {
      // handle save data not found
      if (!assignment) {
        return res.status(NOT_FOUND).send(
          formatResponse('No save data found.', true, NOT_FOUND)
        );
      }

      const { saveData } = assignment;
      const mappedAssignment = Array.isArray(assignmentId)
        ? assignmentId.reduce((prev, id) => ({ ...prev, [id]: saveData.get(id) }), {})
        : { [assignmentId]: saveData.get(assignmentId) };

      return res.status(OK).send(
        formatResponse('Successfully retrieve sava data', true, undefined, { assignment: mappedAssignment })
      );
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
    });
};

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
    const [moduleCode, moduleNumber] = moduleUUID.split(MODULE_SEPARATOR);

    const updatedModule = { [`modules.${moduleCode}.${moduleNumber}`]: FINISHED };

    const updatedData = moduleCode === INTERVENTION_MODULE ? { ...updatedModule, [`modules.${ASSIGNMENT_MODULE}.${moduleNumber}`]: UNLOCKED } : updatedModule;

    UserController.updateUserData(userId, updatedData)
      .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false)));
  }

  AssignmentModel.findOneAndUpdate({ userId, moduleId }, newSave, { upsert: true, new: true })
    .then((assignment) => res.status(CREATED).send(
      formatResponse('Successfully save assignment', true, undefined, {
        currentProgress: assignment.currentProgress,
        totalProgress: assignment.totalProgress,
        saveData: assignment.saveData,
        progress: assignment.progress,
        feedbackData: assignment.feedbackData
      })
    ))
    .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false)));
};

/**
 * feedback
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling save feedback
 */
const feedback = (req, res) => {
  const {
    userId, moduleId, feedbackData
  } = req.body;

  AssignmentModel.findOneAndUpdate({ userId, moduleId }, { feedbackData }, { new: true })
    .then((assignment) => res.status(CREATED).send(
      formatResponse('Successfully save feedback', true, undefined, {
        currentProgress: assignment.currentProgress,
        totalProgress: assignment.totalProgress,
        saveData: assignment.saveData,
        progress: assignment.progress,
        feedbackData: assignment.feedbackData
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
  get,
  save,
  feedback,
  load,
  getSaveData
};
