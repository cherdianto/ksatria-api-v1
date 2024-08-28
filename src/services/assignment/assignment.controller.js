import { StatusCodes } from 'http-status-codes';

import { UserController, UserModel } from '../user';
import { formatResponse } from '../../util';
import constants from '../../constants';

import AssignmentModel from './assignment.model';
import moduleModel from '../module/module.model';

const { OK, CREATED, NOT_FOUND, INTERNAL_SERVER_ERROR } = StatusCodes;

const {
  UNLOCKED,
  IN_PROGRESS,
  FINISHED,
  INTERVENTION_MODULE,
  ASSIGNMENT_MODULE,
  MODULE_SEPARATOR,
} = constants;

/**
 * get
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling get assignment based on id
 */
const get = (req, res) => {
  const {
    userId,
    query: { moduleUUID, assignmentId },
  } = req;

  AssignmentModel.findOne({ userId, moduleUUID })
    .then((assignment) => {
      // handle save data not found
      if (!assignment) {
        return res
          .status(NOT_FOUND)
          .send(formatResponse('No save data found.', true, NOT_FOUND));
      }

      const { saveData } = assignment;
      const mappedAssignment = Array.isArray(assignmentId)
        ? assignmentId.reduce(
            (prev, id) => ({ ...prev, [id]: saveData.get(id) }),
            {}
          )
        : { [assignmentId]: saveData.get(assignmentId) };

      return res.status(OK).send(
        formatResponse('Successfully retrieve sava data', true, undefined, {
          assignment: mappedAssignment,
        })
      );
    })
    .catch((err) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, false));
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
    userId,
    body: { moduleId, moduleUUID, currentProgress, totalProgress, saveData },
  } = req;
  const newSave = {
    moduleUUID,
    currentProgress,
    totalProgress,
    saveData,
    progress: currentProgress !== totalProgress ? IN_PROGRESS : FINISHED,
  };

  if (currentProgress === totalProgress) {
    const [moduleCode, moduleNumber] = moduleUUID.split(MODULE_SEPARATOR);

    const updatedModule = {
      [`modules.${moduleCode}.${moduleNumber}`]: FINISHED,
    };

    const updatedData =
      moduleCode === INTERVENTION_MODULE
        ? {
            ...updatedModule,
            [`modules.${ASSIGNMENT_MODULE}.${moduleNumber}`]: UNLOCKED,
          }
        : updatedModule;

    UserController.updateUserData(userId, updatedData).catch((err) =>
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false))
    );
  }

  AssignmentModel.findOneAndUpdate({ userId, moduleId }, newSave, {
    upsert: true,
    new: true,
  })
    .then((assignment) =>
      res.status(CREATED).send(
        formatResponse('Successfully save assignment', true, undefined, {
          currentProgress: assignment.currentProgress,
          totalProgress: assignment.totalProgress,
          saveData: assignment.saveData,
          progress: assignment.progress,
          feedbackData: assignment.feedbackData,
        })
      )
    )
    .catch((err) =>
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false))
    );
};

/**
 * feedback
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling save feedback
 */
const feedback = async (req, res) => {
  const { userId, moduleId, feedbackData } = req.body;

  try {
    // Construct the update object dynamically based on the feedbackData
    const updateObject = {};
    for (const [assignmentId, feedback] of Object.entries(feedbackData)) {
      const assignmentKey = `saveData.${assignmentId.replace(
        '-',
        '_'
      )}.feedbackData`; // Using dot notation for nested updates
      updateObject[assignmentKey] = feedback;
    }

    console.log(updateObject);

    // Find and update the document with the matching userId and moduleId
    const updatedDocument = await AssignmentModel.findOneAndUpdate(
      { userId, moduleId },
      { $set: updateObject },
      { new: true } // Return the updated document
    );

    if (updatedDocument) {
      res.status(CREATED).send(
        formatResponse('Successfully save feedback', true, undefined, {
          currentProgress: updatedDocument.currentProgress,
          totalProgress: updatedDocument.totalProgress,
          saveData: updatedDocument.saveData,
          progress: updatedDocument.progress,
          feedbackData: updatedDocument.feedbackData,
        })
      );
    } else {
      res.status(NOT_FOUND).send(formatResponse('Module not found', false));
    }
  } catch (error) {
    res
      .status(INTERNAL_SERVER_ERROR)
      .send(formatResponse(error.message, false));
  }
};

/**
 * load
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling load progress data
 */
const load = (req, res) => {
  const {
    userId,
    body: { moduleId },
  } = req;

  AssignmentModel.findOne({ userId, moduleId })
    .then((assignment) => {
      // handle save data not found
      if (!assignment) {
        return res
          .status(NOT_FOUND)
          .send(formatResponse('No save data found.', true, NOT_FOUND));
      }

      const { currentProgress, totalProgress, saveData, progress } = assignment;

      return res.status(OK).send(
        formatResponse('Successfully retrieve sava data', true, undefined, {
          currentProgress,
          totalProgress,
          saveData,
          progress,
        })
      );
    })
    .catch((err) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, false));
    });
};

/**
 * getSaveData
 *
 * @param {string} userId - user Id
 * @param {string} moduleId - module Id
 * @returns get save data for spesific user and module
 */
const getSaveData = (userId, moduleId) =>
  AssignmentModel.findOne({ userId, moduleId }).exec();

/**
 * get all modules
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to get all modules
 */
const getAll = async (req, res) => {
  const userId = req.userId;

  const user = await UserModel.findById(userId);
  if (!user) {
    return res.status(UNAUTHORIZED).send(formatResponse(err.message, false));
  }

  // get all data if role is admin, get only published if other role
  const query =
    user?.roles === 'admin'
      ? { type: 'assignment' }
      : { status: 'published', type: 'assignment' };

  const modules = await moduleModel
    .find(query)
    .select('title description status image moduleUUID');

  if (!modules) {
    return res.status(NOT_FOUND).send(formatResponse(err.message, false));
  }

  res.status(OK).send(
    formatResponse('Successfully retreive all modules', true, undefined, {
      modules,
    })
  );
};

export default {
  get,
  getAll,
  save,
  feedback,
  load,
  getSaveData,
};
