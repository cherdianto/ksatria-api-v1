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
      const existingInvitation = await InvitationModel.findOne({
        email: data.email,
      });

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
  const registrationLink = `http://localhost:3001/register?token=${token}`;

  await InvitationModel.findOne({
    email,
  })
    .then(async (existingInvitation) => {
      if (existingInvitation) {
        if (existingInvitation.status === REGISTERED) {
          // Skip the update if the status is 'REGISTERED'
          return res
            .status(OK)
            .send(
              formatResponse('This email alredy registered in our sistem', true)
            );
        } else {
          await InvitationModel.updateOne(
            { email: email },
            {
              $set: {
                role: role,
                counselorId: counselorId,
                status: PENDING,
                token,
              },
            }
          );

          // Replace with actual sending logic
          await sendEmail({
            recipientEmail: email,
            subject: 'Invitation to join Ksatria Project',
            templateType: 'invitation_template',
            dynamicData: { registrationLink },
          });

          return res
            .status(OK)
            .send(formatResponse('Successfully sent the invitation', true));
        }
      } else {
        await InvitationModel.create({
          email: email,
          role: role,
          counselorId: counselorId,
          status: PENDING,
          token,
        });

        // Replace with actual sending logic
        await sendEmail({
          recipientEmail: email,
          subject: 'Invitation to join Ksatria Project',
          templateType: 'invitation_template',
          dynamicData: { registrationLink },
        });

        return res
          .status(OK)
          .send(formatResponse('Successfully sent the invitation', true));
      }
    })
    .catch(async (err) => {
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, true));
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
    return res
      .status(NOT_FOUND)
      .send(formatResponse('Token invalid or has been used', true));
  }

  const email = isTokenExist.email;

  const { username, password, fullname, semester, whatsapp, faculty } =
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
      .send(
        formatResponse(
          'You have been registered. Please login or contact the administrator',
          true
        )
      );
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
  const { page = 1, limit = 10, filter = {} } = req.query;

  const skip = (page - 1) * limit;
  const limitNum = parseInt(limit, 10);

  try {
    const filterObject = {};

    // Apply filters if provided
    if (filter.email) {
      filterObject.email = { $regex: new RegExp(filter.email, 'i') };
    }
    if (filter.status) {
      filterObject.status = filter.status;
    }
    if (filter.role) {
      filterObject.role = filter.role;
    }

    const total = await InvitationModel.countDocuments(filterObject);
    const invitations = await InvitationModel.find(filterObject)
      .skip(skip)
      .limit(limitNum)
      .exec();

    res.status(OK).send(
      formatResponse('Successfully retrieved invitations', true, undefined, {
        total,
        page: parseInt(page, 10),
        limit: limitNum,
        invitations,
      })
    );
  } catch (error) {
    res
      .status(INTERNAL_SERVER_ERROR)
      .send(formatResponse(error.message, false));
  }
};

/**
 * Delete an invitation
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to delete an invitation
 */
const deleteInvitation = async (req, res) => {
  const { email } = req.params;

  if(!email) {
    return res
        .status(NOT_FOUND)
        .send(formatResponse('Email not found', false));
  }

  try {
    // Find and delete the invitation with the specified email
    const result = await InvitationModel.deleteOne({ email });

    if (result.deletedCount === 0) {
      return res
        .status(NOT_FOUND)
        .send(formatResponse('Invitation not found', false));
    }

    res
      .status(OK)
      .send(formatResponse('Invitation successfully deleted', true));
  } catch (err) {
    res
      .status(INTERNAL_SERVER_ERROR)
      .send(formatResponse(err.message, false));
  }
};

export default {
  bulkCreate,
  invite,
  registerUser,
  verify,
  getAllInvitations,
  deleteInvitation
};
