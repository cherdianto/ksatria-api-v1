/* eslint-disable no-param-reassign */
import { StatusCodes } from 'http-status-codes';

import { UserModel } from '../user';
import { formatResponse, jwt } from '../../util';

const {
  OK, NOT_FOUND, INTERNAL_SERVER_ERROR, UNAUTHORIZED
} = StatusCodes;

/**
 * login
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling login and issue a token
 */
const login = (req, res) => {
  const { username, password } = req.body;

  UserModel.findOne({ username })
    .then((user) => {
      // handle user not found
      if (!user) {
        res.status(NOT_FOUND).send(
          formatResponse(`Can't found user with username: ${username}`, true, NOT_FOUND)
        );
      }

      // handle wrong password
      user.comparePassword(password, (err, isMatch) => {
        if (err) throw err;

        if (isMatch) {
          // generate refresh and access token then send it
          // do not use username from payload just in case there's a mismatch with data in db
          const tokenPayload = { username: user.username, roles: user.roles };

          return res
            .cookie('refreshToken', jwt.generateRefreshToken(tokenPayload), { httpOnly: true, sameSite: 'strict' })
            .header('Authorization', jwt.generateAccessToken(tokenPayload))
            .status(OK)
            .send(formatResponse('Successfully login', true, undefined, { username: user.username }));
        }

        return res.status(UNAUTHORIZED).send(
          formatResponse('Invalid credentials', true, UNAUTHORIZED)
        );
      });
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
    });
};

/**
 * refresh
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling refresh access token
 */
const refresh = (req, res) => {
  const { user: username, roles } = req;
  const tokenPayload = { username, roles };

  res
    .header('Authorization', jwt.generateAccessToken(tokenPayload))
    .status(OK)
    .send(formatResponse('Successfully refresh token', true, undefined, { username }));
};

export default {
  login,
  refresh
};
