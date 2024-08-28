import { StatusCodes } from 'http-status-codes';
import constants from '../../constants';
import { formatResponse } from '../../util';
import UserModel from './user.model';

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
 * get user data
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to retrieve user's own data
 */
const getUserData = (req, res) => {
  const userId = req.userId;

  UserModel.findById(userId)
    .then((user) => {
      if (!user) {
        return res
          .status(NOT_FOUND)
          .send(formatResponse(`User not found`, false));
      }

      // Optionally, you can omit sensitive fields like password before sending the response
      const { password, ...userData } = user.toObject();
      res
        .status(OK)
        .send(
          formatResponse(
            'User data retrieved successfully',
            true,
            undefined,
            userData
          )
        );
    })
    .catch((err) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, false));
    });
};

// get all user data based on role
// PAGINATION AND FILTER
const adminGetAll = (req, res) => {
  // const userId = req.userId;
  const {
    page = 1,
    pageSize = 10,
    filters = {},
    globalFilter = {},
  } = req.query;

  // Parse filters from query string
  let parsedFilters = {};
  try {
    parsedFilters = JSON.parse(filters);
  } catch (error) {
    return res
      .status(400)
      .send(formatResponse('Invalid filters format', false));
  }

  const query = {};
  const projection = '-password -updatedAt -createdAt';

  // Apply filters if any
  if (parsedFilters.email) {
    query.email = parsedFilters.email;
  }
  if (parsedFilters.username) {
    query.username = parsedFilters.username;
  }
  if (parsedFilters.fullname) {
    query.fullname = parsedFilters.fullname;
  }
  if (parsedFilters.role) {
    query.role = parsedFilters.role;
  }
  if (parsedFilters.semester) {
    query.semester = parsedFilters.semester;
  }
  if (parsedFilters.faculty) {
    query.faculty = parsedFilters.faculty;
  }
  if (parsedFilters.status) {
    query.status = parsedFilters.status;
  }
  if (parsedFilters.whatsapp) {
    query.whatsapp = parsedFilters.whatsapp;
  }

  // Apply global filter
  if (globalFilter) {
    query.$or = [
      { email: { $regex: globalFilter, $options: 'i' } },
      { fullname: { $regex: globalFilter, $options: 'i' } },
      { username: { $regex: globalFilter, $options: 'i' } },
      { whatsapp: { $regex: globalFilter, $options: 'i' } },
      { role: { $regex: globalFilter, $options: 'i' } },
      // { semester: { $regex: globalFilter, $options: 'i' } },
      { faculty: { $regex: globalFilter, $options: 'i' } },
      { status: { $regex: globalFilter, $options: 'i' } },
    ];
  }

  UserModel.countDocuments(query)
    .then((total) => {
      UserModel.find(query)
        .select(projection)
        .skip((page - 1) * pageSize)
        .limit(Number(pageSize))
        .then((userData) => {
          res.status(OK).send(
            formatResponse(
              'Successfully retrieved user data',
              true,
              undefined,
              {
                data: userData,
                total,
              }
            )
          );
        })
        .catch((err) => {
          res
            .status(INTERNAL_SERVER_ERROR)
            .send(formatResponse(err.message, false));
        });
    })
    .catch((err) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, false));
    });
};

// counselor get all students
const getStudents = (req, res) => {
  const isCounselor = req.roles === 'counselor' ? true : false;
  const filter =
    req.roles === 'counselor' ? { counselorId: req.userId } : req.body || {};
  const options = isCounselor
    ? '-password -__v -createdAt -updatedAt -counselorId -roles'
    : '-password -__v';
  UserModel.find(filter, options)
    .then((users) => {
      // case db = empty
      if (users.length === 0) {
        return res
          .status(OK)
          .json(
            formatResponse(
              isCounselor ? 'No student found.' : 'No user found.',
              true
            )
          );
      }
      return res
        .status(OK)
        .json(
          formatResponse(
            'Successfully retrieve all user data',
            true,
            undefined,
            { users }
          )
        );
    })
    .catch((err) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, false));
    });
};

const getStudentsByPsychologist = async (req, res) => {
  console.log(req.userId)
  const counselors = await UserModel.find({ psychologistId: req.userId, roles: 'counselor'})

  const counselorIds = counselors.map(counselor => counselor._id)

  const allStudents = await UserModel.find({ counselorId: { $in: counselorIds}}).select('-password')
  if (allStudents.length === 0) {
    return res
      .status(OK)
      .json(
        formatResponse('No student found.',
          true
        )
      );
  }
  return res
    .status(OK)
    .json(
      formatResponse(
        'Successfully retrieve all user data',
        true,
        undefined,
        { allStudents }
      )
    );



  
};

const getCounselors = (req, res) => {
  UserModel.find({ roles: 'counselor' })
    .select('fullname _id')
    .then((counselors) => {
      // case db = empty
      if (counselors.length === 0) {
        return res.status(OK).json(formatResponse('No counselor found.', true));
      }
      return res
        .status(OK)
        .json(
          formatResponse(
            'Successfully retrieve all counselor data',
            true,
            undefined,
            { counselors }
          )
        );
    })
    .catch((err) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, false));
    });
};

const getPsychologists = (req, res) => {
  UserModel.find({ roles: 'psychologist' })
    .select('fullname _id')
    .then((psychologist) => {
      // case db = empty
      if (psychologist.length === 0) {
        return res.status(OK).json(formatResponse('No counselor found.', true));
      }
      return res
        .status(OK)
        .json(
          formatResponse(
            'Successfully retrieve all counselor data',
            true,
            undefined,
            { psychologist }
          )
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
  const { username, password, fullname, semester, whatsapp, faculty } =
    req.body;
  const newUser = new UserModel({
    username,
    email,
    password,
    fullname,
    roles: USER,
    status: ACTIVE,
  });

  newUser
    .save()
    .then(() => {
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
 * update user details
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to update user details
 */
const updateUserProfile = (req, res) => {
  const { username, fullname, semester, whatsapp, faculty, email } = req.body;
  const userId = req.userId;

  UserModel.findById(userId)
    .then(async (user) => {
      if (!user) {
        return res
          .status(NOT_FOUND)
          .send(formatResponse(`User not found`, false));
      }

      if (user.email !== email) {
        const isDuplicateEmail = await UserModel.findOne({ email });
        if (isDuplicateEmail)
          throw new Error('Email is taken, please use another email address');
      }

      if (user.whatsapp !== whatsapp) {
        const isDuplicateWhatsapp = await UserModel.findOne({ whatsapp });
        if (isDuplicateWhatsapp)
          throw new Error(
            'Whatsapp is taken, please use another whatsapp number'
          );
      }

      if (user.username !== username) {
        const isDuplicateUsername = await UserModel.findOne({ username });
        if (isDuplicateUsername)
          throw new Error(
            'Username is taken, please use another username number'
          );
      }

      if (user.fullname !== fullname) {
        const isDuplicateFullname = await UserModel.findOne({ fullname });
        if (isDuplicateFullname)
          throw new Error('Name is taken, please use another name');
      }

      // Update user fields
      user.username = username || user.username;
      user.email = email || user.email;
      user.fullname = fullname || user.fullname;
      user.semester = semester || user.semester;
      user.whatsapp = whatsapp || user.whatsapp;
      user.faculty = faculty || user.faculty;

      return user.save();
    })
    .then(() => {
      res
        .status(OK)
        .send(formatResponse(`Successfully updated user: ${username}`, true));
    })
    .catch((err) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, false));
    });
};

/**
 * update user details
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to admin update user details
 */
const adminUpdateUserData = (req, res) => {
  const {
    userId,
    username,
    fullname,
    semester,
    whatsapp,
    faculty,
    email,
    roles,
    counselorId,
    psychologistId,
    status,
  } = req.body;

  UserModel.findById(userId)
    .then((user) => {
      if (!user) {
        return res
          .status(NOT_FOUND)
          .send(formatResponse(`User not found`, false));
      }

      // Update user fields
      user.username = username || user.username;
      user.email = email || user.email;
      user.fullname = fullname || user.fullname;
      user.semester = semester || user.semester;
      user.whatsapp = whatsapp || user.whatsapp;
      user.faculty = faculty || user.faculty;
      user.roles = roles || user.roles;
      user.status = status || user.status;
      user.counselorId = roles === 'user' ? counselorId : null;
      user.psychologistId = roles === 'counselor' ? psychologistId : null;

      return user.save();
    })
    .then(() => {
      res
        .status(OK)
        .send(formatResponse(`Successfully update user: ${username}`, true));
    })
    .catch((err) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, false));
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
        return res
          .status(NOT_FOUND)
          .send(formatResponse("Username doesn't exist", true, NOT_FOUND));
      }

      return res
        .status(OK)
        .send(
          formatResponse(
            'Successfully retrieve user modules',
            true,
            undefined,
            { modules }
          )
        );
    })
    .catch((err) => {
      res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, false));
    });
};

// /**
//  * updateUserData
//  *
//  * @param {string} userId - user Id
//  * @param {Object} newData - new user data
//  * @returns controller to handling update some user data
//  */
// const updateUserData = (userId, newData) =>
//   UserModel.findOneAndUpdate({ _id: userId }, newData, { new: true }).exec();

/**
 * updateUserData
 *
 * @param {string} userId - user Id
 * @param {Object} newData - new user data
 * @returns controller to handling update some user data
 */
const updateUserData = (userId, newData) =>
  UserModel.findOneAndUpdate({ _id: userId }, newData, { new: true }).exec();

/**
 * updateIntro
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling update intro status
 */
const updateIntro = (req, res) =>
  updateUserData(req.userId, {
    [`modules.${INTERVENTION_MODULE}.${INTRO_MODULE}`]: FINISHED,
    [`modules.${INTERVENTION_MODULE}.${FIRST_MODULE}`]: UNLOCKED,
  })
    .then(() =>
      res
        .status(OK)
        .send(formatResponse('Successfully update tutorial status', true))
    )
    .catch((err) => {
      console.log(err);
      res
        .status(INTERNAL_SERVER_ERROR)
        .send(formatResponse(err.message, false));
    });

/**
 * updateModules
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling update spesific user modules
 */
const updateModules = (req, res) => {
  const [moduleCode, moduleNumber] =
    req.body.moduleUUID.split(MODULE_SEPARATOR);

  updateUserData(req.body.userId, {
    [`modules.${moduleCode}.${moduleNumber}`]: req.body.moduleStatus,
  })
    .then(() =>
      res
        .status(OK)
        .send(formatResponse('Successfully update user modules status', true))
    )
    .catch((err) =>
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false))
    );
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
    .then(() =>
      res
        .status(OK)
        .send(formatResponse('Successfully update user counselor', true))
    )
    .catch((err) =>
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false))
    );
};

export default {
  getStudents,
  getCounselors,
  create,
  getModules,
  updateIntro,
  updateModules,
  updateCounselor,
  updateUserData,
  adminGetAll,
  updateUserProfile,
  getUserData,
  adminUpdateUserData,
  getPsychologists,
  getStudentsByPsychologist
};
