import { StatusCodes } from 'http-status-codes';

import { UserController, UserModel } from '../user/index.js';
import { formatResponse } from '../../util/index.js';
import constants from '../../constants/index.js';

import AssignmentModel from './assignment.model.js';
import moduleModel from '../module/module.model.js';
import assignmentModel from './assignment.model.js';
import { sendEmail } from '../../util/emailNotification.js';
import XLSX from 'xlsx'
import archiver from 'archiver';

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
    progress: currentProgress === totalProgress ? FINISHED : IN_PROGRESS,
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
  } else {
    const [moduleCode, moduleNumber] = moduleUUID.split(MODULE_SEPARATOR);

    const updatedModule = {
      [`modules.${moduleCode}.${moduleNumber}`]: IN_PROGRESS,
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
    .then((assignment) => {
      console.log('Updated Assignment:', assignment);
      res.status(CREATED).send(
        formatResponse('Successfully save assignment', true, undefined, {
          currentProgress: assignment.currentProgress,
          totalProgress: assignment.totalProgress,
          saveData: assignment.saveData,
          progress: assignment.progress,
          feedbackData: assignment.feedbackData,
        })
      );
    })
    .catch((err) => {
      console.error('Error updating assignment:', err);
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
    });
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

const overallFeedback = async (req, res) => {
  const { userId, moduleUUID} = req.body;
 
  
  const user = await UserModel.findById(userId);
  if (!user) {
    return res.status(UNAUTHORIZED).send(formatResponse(err.message, false));
  }

  try {
        // Find and update the document with the matching userId and moduleId
    const document = await AssignmentModel.findOne({ userId, moduleUUID });

    if (!document) {
      // If the document is not found
      return res
        .status(NOT_FOUND)
        .send(formatResponse('Module not found', false));
    }

    if (document.overallFeedback === 'true') {
      // If it's already true, no need to update
      return res.status(OK).send(
        formatResponse('Notification already sent', true, undefined, {
          overallFeedback: document.overallFeedback,
        })
      );
    }

    const updatedDocument = await AssignmentModel.findOneAndUpdate(
      { userId, moduleUUID },
      { $set: {
        overallFeedback: true
      } },
      { new: true } // Return the updated document
    );

    if (updatedDocument) {

     user?.email && await sendEmail({
        recipientEmail: user.email,
        subject: 'Feedback dari konselor telah tersedia',
        templateType: 'feedback_notification',
        dynamicData: {moduleUUID},
      });

      res.status(CREATED).send(
        formatResponse('Successfully sending notification', true, undefined, {
          overallFeedback: updatedDocument.overallFeedback,
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

const getSaveData = (userId, moduleId) =>
  AssignmentModel.findOne({ userId, moduleId }).exec();

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


const getAllAssignment = async (req, res) => {
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

  const assignments = await AssignmentModel
    .find({userId})

  if (!assignments) {
    return res.status(NOT_FOUND).send(formatResponse(err.message, false));
  }

  res.status(OK).send(
    formatResponse('Successfully retreive all assignments', true, undefined, {
      assignments,
    })
  );
};

const exportData = async (req, res) => {
  try {
    const assignments = await AssignmentModel.find().populate('userId');

    // Group assignments by moduleUUID
    const groupedByModule = assignments.reduce((acc, assignment) => {
      if (!acc[assignment.moduleUUID]) {
        acc[assignment.moduleUUID] = [];
      }
      acc[assignment.moduleUUID].push(assignment);
      return acc;
    }, {});

    // Create a zip stream to package all the files
    const zipFileName = 'assignments.zip';
    const zipStream = archiver('zip', { zlib: { level: 9 } });

    // Set up the response headers for downloading the .zip file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);
    
    // Pipe the zipStream to the response
    zipStream.pipe(res);

    // Iterate over each module group
    for (let moduleUUID in groupedByModule) {
      const moduleAssignments = groupedByModule[moduleUUID];

      // For each module, create a workbook and add the user sheets
      const workbook = XLSX.utils.book_new();

      // For each assignment in the group, create a sheet named by userId.fullname
      for (let assignment of moduleAssignments) {
        const rows = [];

        // Check if saveData exists and is a Map
        if (assignment.saveData && assignment.saveData instanceof Map) {
          // Iterate over the Map using forEach to access key-value pairs
          assignment.saveData.forEach((save, key) => {
            // Push data from saveData into rows
            rows.push({
              assignmentId: save.assignmentId,
              question: save.question,
              answer: save.answer,
              feedbackData: save.feedbackData || 'n/a',  // Use 'n/a' if feedbackData is missing
            });
          });
        } else {
          console.log(`No valid saveData found for assignment ${assignment._id}`);
        }

        // Convert rows to a worksheet
        const worksheet = XLSX.utils.json_to_sheet(rows);

        // Append the worksheet to the workbook, using the user full name as the sheet name
        const userFullName = assignment.userId ? assignment.userId.fullname : 'Unknown User';
        XLSX.utils.book_append_sheet(workbook, worksheet, userFullName);
      }

      // Create a filename based on moduleUUID
      const fileName = `${moduleUUID}.xlsx`;

      // Create the .xlsx file in memory (as a buffer) and append it to the zip stream
      const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      zipStream.append(fileBuffer, { name: fileName });
      
      console.log(`Module ${moduleUUID} added to zip.`);
    }

    // Finalize the zip file
    zipStream.finalize();
  } catch (error) {
    console.log('Error during export:', error.message);
    return res.status(INTERNAL_SERVER_ERROR).send(formatResponse(error.message, false));
  }
};



export default {
  get,
  getAll,
  save,
  feedback,
  load,
  getSaveData,
  overallFeedback,
  getAllAssignment,
  exportData
};
