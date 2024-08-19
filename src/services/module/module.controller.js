import { StatusCodes } from 'http-status-codes';

import ModuleModel from './module.model';
import { formatResponse } from '../../util';
import assignmentController from '../assignment/assignment.controller';
import { UserModel } from '../user';

const { OK, CREATED, NOT_FOUND, INTERNAL_SERVER_ERROR, UNAUTHORIZED } =
  StatusCodes;

/**
 * create or update existing module
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to register new module
 */
const create = (req, res) => {
  const { moduleUUID, moduleContent, image, description, title } = req.body;
  const newModule = {
    moduleUUID,
    moduleContent,
    image,
    description,
    title,
    status: 'draft',
  };

  ModuleModel.findOneAndUpdate({ moduleUUID }, newModule, {
    new: true,
    upsert: true,
  })
    .then(() => {
      res
        .status(CREATED)
        .send(
          formatResponse(`Successfully register module ${moduleUUID}`, true)
        );
    })
    .catch((err) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, false));
    });
};

/**
 * get spesicfic module
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to get specific module
 */
const getDetailModule = (req, res) => {
  const { moduleUUID, language } = req.query;
  ModuleModel.findOne({ moduleUUID })
    .then(async (module) => {
      // handle module not found
      if (!module) {
        return res
          .status(NOT_FOUND)
          .send(formatResponse("Module doesn't exist", true, NOT_FOUND));
      }

      return res.status(OK).send(
        formatResponse('Successfully retrieve module', true, undefined, {
          id: module._id,
          moduleUUID: module.moduleUUID,
          image: module.image,
          title: module.title,
          description: module.description,
          contents: module.moduleContent[language] || {},
          // progress: mappedSaveData || {},
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
 * get spesicfic module
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to get specific module
 */
const get = (isAdmin) => (req, res) => {
  const { moduleUUID, language } = req.query;

  console.log(moduleUUID);
  console.log(language);
  ModuleModel.findOne({ moduleUUID })
    .then(async (module) => {
      // handle module not found
      if (!module) {
        return res
          .status(NOT_FOUND)
          .send(formatResponse("Module doesn't exist", true, NOT_FOUND));
      }

      const userId = isAdmin ? req.query.userId : req.userId;
      const _loadSaveData = await assignmentController.getSaveData(
        userId,
        module._id
      );
      let mappedSaveData = null;

      // attach user save data
      if (_loadSaveData) {
        const {
          currentProgress,
          totalProgress,
          saveData,
          progress,
          feedbackData,
        } = _loadSaveData;

        mappedSaveData = {
          currentProgress,
          totalProgress,
          progress,
          saveData,
          feedbackData,
        };
      }

      return res.status(OK).send(
        formatResponse('Successfully retrieve module', true, undefined, {
          id: module._id,
          moduleUUID: module.moduleUUID,
          contents: module.moduleContent[language] || {},
          progress: mappedSaveData || {},
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
  const query = user?.roles === 'admin' ? {} : { status: 'published' };

  const modules = await ModuleModel.find(query).select(
    'title description status image moduleUUID'
  );

  if (!modules) {
    return res.status(NOT_FOUND).send(formatResponse(err.message, false));
  }

  res.status(OK).send(
    formatResponse('Successfully retreive all modules', true, undefined, {
      modules,
    })
  );
};

/**
 * delete a module without deleting the user assignment data
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to delete a module
 */
const deleteModule = (req, res) => {
  const { moduleUUID } = req.params;

  ModuleModel.findOneAndDelete({ moduleUUID })
    .then((deletedModule) => {
      if (!deletedModule) {
        return res
          .status(NOT_FOUND)
          .send(formatResponse("Module doesn't exist", false, NOT_FOUND));
      }

      return res
        .status(NO_CONTENT)
        .send(
          formatResponse(`Successfully deleted module ${moduleUUID}`, true)
        );
    })
    .catch((err) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, false));
    });
};

export default {
  create,
  get,
  getAll,
  getDetailModule,
  deleteModule,
};
