import nodemailer from 'nodemailer';
import fs from 'fs';

// Load email templates
const invitationTemplate = fs.readFileSync(
  'src/templates/email_templates/invitation_template.html',
  'utf-8'
);
const resetPasswordTemplate = fs.readFileSync(
  'src/templates/email_templates/reset_password_template.html',
  'utf-8'
);
const notificationTemplate = fs.readFileSync(
  'src/templates/email_templates/notification_template.html',
  'utf-8'
);
const passwordChangedTemplate = fs.readFileSync(
  'src/templates/email_templates/password_changed_template.html',
  'utf-8'
);

const feedbackNotification = fs.readFileSync(
  'src/templates/email_templates/feedback_notification.html',
  'utf-8'
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Function to send an email with template
export const sendEmail = async ({
  recipientEmail,
  subject,
  templateType,
  dynamicData = {},
}) => {
  let htmlTemplate = '';
  let emailSubject = '';

  // Determine which template to use based on templateType
  switch (templateType) {
    case 'invitation_template':
      htmlTemplate = invitationTemplate.replace(
        '{{registrationLink}}',
        dynamicData.registrationLink
      );
      emailSubject = subject || 'Invitation to Register';
      break;
    case 'reset_password_template':
      htmlTemplate = resetPasswordTemplate.replace(
        '{{resetPasswordLink}}',
        dynamicData.resetPasswordLink
      );
      emailSubject = subject ||  'Reset Your Password';
      break;
    case 'notification_template':
      htmlTemplate = notificationTemplate.replace(
        '{{notificationBody}}',
        dynamicData.notificationBody
      );
      emailSubject = subject || 'Notification';
      break;
    case 'password_changed_template':
      htmlTemplate = passwordChangedTemplate.replace(
        '{{fullname}}',
        dynamicData.fullname
      );
      emailSubject = subject || 'Password Change Notification';
      break;
    case 'feedback_notification':
      htmlTemplate = feedbackNotification.replace(
        '{{moduleUUID}}',
        dynamicData.moduleUUID
      );
      emailSubject = subject || 'Feedback Notification';
      break;
    default:
      throw new Error('Invalid template type');
  }



  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: recipientEmail,
    subject: emailSubject,
    html: htmlTemplate,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return info.response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendGeneralNotification = async (message) => {

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: 'webcreatia@gmail.com',
    subject: 'General Notification from Ksatria',
    text: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('General notification email sent:', info.response);
    return info.response;
  } catch (error) {
    console.error('Error sending general notification email:', error);
    throw error;
  }
};
