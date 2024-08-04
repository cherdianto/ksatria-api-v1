import { StatusCodes } from 'http-status-codes';

import constants from '../../constants';
import { formatResponse } from '../../util';
import { sendEmail } from '../../util/emailNotification';
import InvitationModel from './invitation.model';
import UserModel from '../user/user.model';
import tokenGenerator from '../../util/tokenGenerator';
import checkDuplicateField from '../../util/checkDuplicateField';

const { OK, CREATED, NOT_FOUND, INTERNAL_SERVER_ERROR } = StatusCodes;
const {
  UNLOCKED,
  FINISHED,
  INTERVENTION_MODULE,
  INTRO_MODULE,
  FIRST_MODULE,
  MODULE_SEPARATOR,
  ACTIVE,
} = constants;

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

    res
      .status(CREATED)
      .send(formatResponse(`Successfully add invitation tasks`, true));
  } catch (err) {
    res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
  }
};

/**
 * create new user
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to register bulk invitation
 */
const invite = async (req, res) => {
  const { email, counselorId, role } = req.body;

  // generate a token
  const token = tokenGenerator();

  // sending invitation mail
  const registrationLink = `http://localhost:3001/invitation?token=${token}`;

  // Replace with actual sending logic
  await sendEmail({
    recipientEmail: email,
    subject: 'Invitation to join Ksatria Project',
    templateType: 'invitation_template',
    dynamicData: { registrationLink },
  });

  const newInvitation = new InvitationModel({
    email,
    // counselorId,
    role,
    token,
  });

  newInvitation
    .save()
    .then(() => {
      res
        .status(CREATED)
        .send(formatResponse('Successfully send an invitation', true));
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
const registerUser = async (req, res) => {
  const isTokenExist = await InvitationModel.findOne({ token: req.body.token });
  if (!isTokenExist) {
    res
      .status(NOT_FOUND)
      .send(formatResponse('Token invalid or has been used', true));
  }

  const { username, password, fullname, semester, whatsapp, faculty, email } =
    req.body;

  if (await checkDuplicateField('email', email)) {
    return res.status(INTERNAL_SERVER_ERROR).send(formatResponse('Email has been registered, please use another email', false));
  }

  if (await checkDuplicateField('whatsapp', whatsapp)) {
    return res.status(INTERNAL_SERVER_ERROR).send(formatResponse('Whatsapp has been registered, please use another number', false));
  }

  if (await checkDuplicateField('username', username)) {
    return res.status(INTERNAL_SERVER_ERROR).send(formatResponse('Username has been registered, please use another username', false));
  }


  const newUser = new UserModel({
    email,
    semester,
    whatsapp,
    faculty,
    username,
    email,
    password,
    fullname,
    roles: isTokenExist.role,
    status: ACTIVE,
    counselorId: isTokenExist.counselorId,
  });

  newUser
    .save()
    .then(() => {
      InvitationModel.findOneAndDelete({ token });

      res
        .status(CREATED)
        .send(formatResponse(`Successfully register user: ${username}`, true));
    })
    .catch((err) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, false));
    });
};

export default {
  bulkCreate,
  invite,
  registerUser,
};
