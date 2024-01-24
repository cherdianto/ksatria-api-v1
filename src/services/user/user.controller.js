import { StatusCodes } from 'http-status-codes';

import UserModel from './user.model';
import { formatResponse } from '../../util';

const {
  CREATED, INTERNAL_SERVER_ERROR
} = StatusCodes;

// Getting all user
// TODO: implemented later
// const get = (req, res) => {
//   UserModel.find()
//     .then((users) => {
//       // case db = empty
//       if (users.length === 0) {
//         return res
//           .status(OK)
//           .json(
//             formatResponse('Database is empty', true)
//           );
//       }
//       return res.status(OK).json(
//         formatResponse('Successfully retrieve all user data', true, undefined, { users })
//       );
//     })
//     .catch((err) => {
//       res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
//     });
// };

/**
 * create new user
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to register new uiser
 */
const create = (req, res) => {
  const { username, password } = req.body;
  const newUser = new UserModel({ username, password });

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

export default {
  create
  // remove
};
