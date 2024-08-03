import { StatusCodes } from 'http-status-codes';

import constants from '../../constants';
import { formatResponse } from '../../util';
import { sendEmail } from '../../util/emailNotification';
import InvitationModel from './invitation.model';
import tokenGenerator from '../../util/tokenGenerator';

const { OK, CREATED, NOT_FOUND, INTERNAL_SERVER_ERROR } = StatusCodes;
const {
  UNLOCKED,
  FINISHED,
  INTERVENTION_MODULE,
  INTRO_MODULE,
  FIRST_MODULE,
  MODULE_SEPARATOR,
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
  const invitationLink = `${CLIENT_URL}/invitation?token=${token}`;

  // Replace with actual sending logic
  await sendEmail({
    recipientEmail: email,
    subject: 'Invitation to join Ksatria Project',
    templateType: 'invitation_template',
    dynamicData: { invitationLink },
  });

  const newInvitation = new InvitationModel({
    email,
    counselorId,
    role,
    token,
  });

  newInvitation.save()
  .then(() => {
    res.status(CREATED).send(
      formatResponse('Successfully send an invitation', true)
    );
  })
  .catch((err) => {
    res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
  });
};

export default {
  bulkCreate,
  invite,
};
