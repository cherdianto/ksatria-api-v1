import { StatusCodes } from 'http-status-codes';

import constants from '../../constants';
import { formatResponse } from '../../util';

import InvitationModel from './invitation.model';

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
 * @returns controller to register bulk invitation
 */
const bulkCreate = async (req, res) => {
  const { bulkData } = req.body;
  
  try {
    await InvitationModel.insertMany(bulkData);

    res.status(CREATED).send(
      formatResponse(`Successfully add invitation tasks`, true));
  } catch (err) {
    res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
  }
};

export default {
  bulkCreate
}
