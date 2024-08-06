import cron from 'node-cron';
import tokenGenerator from '../../util/tokenGenerator';
import { sendEmail } from '../../util/emailNotification';
import InvitationModel from './invitation.model';
import constants from '../../constants';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { formatResponse, logger } from '../../util';

const { PENDING, SENT } = constants;

let cronJob = null;
let jobScheduled = false;

const _sendInvitation = async (email, role, counselorId) => {
  // generate a token
  const token = tokenGenerator();

  // sending invitation mail
  const registrationLink = `${process.env.CLIENT_URL}/register?token=${token}`;

  // Replace with actual sending logic
  await sendEmail({
    recipientEmail: email,
    subject: 'Invitation to join Ksatria Project',
    templateType: 'invitation_template',
    dynamicData: { registrationLink },
  });

  logger.info('send invitation email to ' + email);

  return token;
};

export const startCronJob = () => {
  if (jobScheduled) return; // prevent from starting multiple jobs

  logger.info('cron job start');
  jobScheduled = true;

  cronJob = cron.schedule(
    `*/${process.env.CRON_DELAY} * * * * *`,
    async () => {
      const remainingTask = await InvitationModel.findOne({
        status: PENDING,
      });

      if (!remainingTask) {
        // cron finished
        stopCronJob();
        return;
      }

      // if task available, send the invitation
      const { email, role, counselorId } = remainingTask;
      logger.info(email);
      const token = await _sendInvitation(email, role, counselorId);
      // logger.info(token);
      remainingTask.status = SENT;
      remainingTask.token = token;
      await remainingTask.save();
      // logger.info(remainingTask);
    },
    {
      scheduled: true,
    }
  );
};

export const stopCronJob = () => {
  if (cronJob) {
    logger.info('cron job stop');
    cronJob.stop();
    jobScheduled = false;
    cronJob = null;
  }
};

export const checkAndStartCronJob = async () => {
  try {
    const remainingTask = await InvitationModel.findOne({ status: PENDING });

    if (remainingTask) {
      // If there are pending tasks, start the cron job
      startCronJob();
    } else {
      logger.info('No pending invitation found.');
    }
  } catch (error) {
    logger.error('Error checking for pending tasks:', error);
  }
};
