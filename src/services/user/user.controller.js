import { StatusCodes } from 'http-status-codes';

import constants from '../../constants';
import { formatResponse } from '../../util';

import UserModel from './user.model';

const {
  OK, CREATED, NOT_FOUND, INTERNAL_SERVER_ERROR
} = StatusCodes;
const {
  UNLOCKED,
  FINISHED,
  INTERVENTION_MODULE,
  INTRO_MODULE,
  FIRST_MODULE,
  MODULE_SEPARATOR
} = constants;

// Getting all user
const get = (isCounselor) => (req, res) => {
  const filter = isCounselor ? { counselorId: req.userId } : (req.body || {});
  const options = isCounselor ? '-password -__v -createdAt -updatedAt -counselorId -roles' : '-password -__v';
  UserModel.find(filter, options)
    .then((users) => {
      // case db = empty
      if (users.length === 0) {
        return res
          .status(OK)
          .json(
            formatResponse(isCounselor ? 'No student found.' : 'No user found.', true)
          );
      }
      return res.status(OK).json(
        formatResponse('Successfully retrieve all user data', true, undefined, { users })
      );
    })
    .catch((err) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, false));
    });
};

/**
 * create new user
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to register new user
 */
const create = (req, res) => {
  const { username, password, fullname, semester, whatsapp, faculty } = req.body;
  const newUser = new UserModel({ username, email, password, fullname, roles: USER, status: ACTIVE,  });

  newUser.save()
    .then(() => {
      res.status(CREATED).send(
        formatResponse(`Successfully register user: ${username}`, true)
      );
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
    });
};

/**
 * get user modules status
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to get user modules status
 */
const getModules = (req, res) => {
  const { username } = req;

  UserModel.findOne({ username })
    .then((user) => {
      const { modules } = user;
      // handle user not found
      if (!user) {
        return res.status(NOT_FOUND).send(
          formatResponse('Username doesn\'t exist', true, NOT_FOUND)
        );
      }

      return res.status(OK).send(
        formatResponse('Successfully retrieve user modules', true, undefined, { modules })
      );
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
    });
};

/**
 * updateUserData
 *
 * @param {string} userId - user Id
 * @param {Object} newData - new user data
 * @returns controller to handling update some user data
 */
const updateUserData = (userId, newData) => UserModel
  .findOneAndUpdate({ _id: userId }, newData, { new: true }).exec();

/**
 * updateIntro
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling update intro status
 */
const updateIntro = (req, res) => updateUserData(req.userId, { [`modules.${INTERVENTION_MODULE}.${INTRO_MODULE}`]: FINISHED, [`modules.${INTERVENTION_MODULE}.${FIRST_MODULE}`]: UNLOCKED })
  .then(() => res.status(OK).send(
    formatResponse('Successfully update tutorial status', true)
  ))
  .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false)));

/**
 * updateModules
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling update spesific user modules
 */
const updateModules = (req, res) => {
  const [moduleCode, moduleNumber] = req.body.moduleUUID.split(MODULE_SEPARATOR);

  updateUserData(req.body.userId, { [`modules.${moduleCode}.${moduleNumber}`]: req.body.moduleStatus })
    .then(() => res.status(OK).send(
      formatResponse('Successfully update user modules status', true)
    ))
    .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false)));
};

/**
 * updateCounselor
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling update counselor for spesific user
 */
const updateCounselor = (req, res) => {
  updateUserData(req.body.userId, { counselorId: req.body.counselorId })
    .then(() => res.status(OK).send(
      formatResponse('Successfully update user counselor', true)
    ))
    .catch((err) => res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false)));
};

export default {
  get,
  create,
  getModules,
  updateIntro,
  updateModules,
  updateCounselor,
  updateUserData
};
