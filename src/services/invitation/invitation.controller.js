import { StatusCodes } from 'http-status-codes';

import constants from '../../constants';
import { formatResponse, logger } from '../../util';
import { sendEmail } from '../../util/emailNotification';
import InvitationModel from './invitation.model';
import UserModel from '../user/user.model';
import tokenGenerator from '../../util/tokenGenerator';
import checkDuplicateField from '../../util/checkDuplicateField';
import { startCronJob } from './invitation.cronjob';

const { OK, CREATED, NOT_FOUND, INTERNAL_SERVER_ERROR } = StatusCodes;
const { ACTIVE, PENDING, USER, REGISTERED } = constants;

/**
 * create new user
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to register bulk invitation
 */
const bulkCreate = async (req, res) => {
  const { bulkData } = req.body;

  try {
    for (const data of bulkData) {
      // Find the document with the specified email
      const existingInvitation = await InvitationModel.findOne({ email: data.email });
    
      if (existingInvitation) {
        // If a document with the specified email exists
        if (existingInvitation.status === REGISTERED) {
          // Skip the update if the status is 'REGISTERED'
          continue;
        } else {
          // Update the document if the status is not REGISTERED
          await InvitationModel.updateOne(
            { email: data.email },
            {
              $set: {
                role: data.role,
                counselorId: data.counselorId,
                status: PENDING,
              },
            }
          );
        }
      } else {
        // Insert a new document if no document with the specified email exists
        await InvitationModel.create({
          email: data.email,
          role: data.role,
          counselorId: data.counselorId,
          status: PENDING,
        });
      }
    }
    
    startCronJob();

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

  logger.info(isTokenExist);

  if (!isTokenExist) {
    return res
      .status(NOT_FOUND)
      .send(formatResponse('Token invalid or has been used', true));
  }

  const { username, password, fullname, semester, whatsapp, faculty, email } =
    req.body;

  if (await checkDuplicateField('email', email)) {
    isTokenExist.token = null;
    isTokenExist.status = REGISTERED;
    await isTokenExist.save();

    return res
      .status(INTERNAL_SERVER_ERROR)
      .send(
        formatResponse(
          'Your email has been registered, please login or contact the administrator',
          false
        )
      );
  }

  if (await checkDuplicateField('whatsapp', whatsapp)) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send(
        formatResponse(
          'Whatsapp has been registered, please use another number',
          false
        )
      );
  }

  if (await checkDuplicateField('username', username)) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send(
        formatResponse(
          'Username has been registered, please use another username',
          false
        )
      );
  }

  logger.info(isTokenExist);

  const newUser = new UserModel({
    email,
    semester,
    whatsapp,
    faculty,
    username,
    email,
    password,
    fullname,
    roles: isTokenExist?.role ? isTokenExist.role : USER,
    status: ACTIVE,
    counselorId: isTokenExist?.counselorId ? isTokenExist.counselorId : null,
  });

  newUser
    .save()
    .then(async () => {
      // InvitationModel.findOneAndUpdate(
      //   { token: isTokenExist.token },
      //   {
      //     $set: {
      //       token: null,
      //       status: <REGISTERED></REGISTERED>,
      //     },
      //   }
      // );

      isTokenExist.token = null;
      isTokenExist.status = REGISTERED;
      await isTokenExist.save();

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

/**
 * create new user
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to register new user
 */
const verify = async (req, res) => {
  const isTokenExist = await InvitationModel.findOne({ token: req.body.token });

  if (!isTokenExist) {
    return res
      .status(NOT_FOUND)
      .send(formatResponse('Token invalid or has been used', true));
  }

  if (isTokenExist.status === REGISTERED) {

    // remove the token
    isTokenExist.token = null;
    await isTokenExist.save();

    return res
      .status(INTERNAL_SERVER_ERROR)
      .send(formatResponse('You have been registered. Please login or contact the administrator', true));
  }

  res.status(OK).send(
    formatResponse('Token is valid', true, undefined, {
      email: isTokenExist.email,
    })
  );
};

/**
 * Retrieve all invitation data with pagination
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to get paginated invitation data
 */
const getAllInvitations = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Validate and parse page and limit
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  if (isNaN(pageNumber) || pageNumber < 1) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send(formatResponse('Invalid page number', false));
  }

  if (isNaN(pageSize) || pageSize < 1) {
    return res
      .status(INTERNAL_SERVER_ERROR)
      .send(formatResponse('Invalid limit', false));
  }

  try {
    const totalInvitations = await InvitationModel.countDocuments();
    const invitations = await InvitationModel.find()
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 }); // Optional: sort by creation date in descending order

    res.status(OK).send(
      formatResponse('Successfully retrieved invitations', true, undefined, {
        total: totalInvitations,
        page: pageNumber,
        limit: pageSize,
        invitations,
      })
    );
  } catch (err) {
    logger.error('Error retrieving invitations:', err);
    res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
  }
};

export default {
  bulkCreate,
  invite,
  registerUser,
  verify,
  getAllInvitations,
};
