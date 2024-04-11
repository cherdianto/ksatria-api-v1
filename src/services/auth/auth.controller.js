import { StatusCodes } from 'http-status-codes';

import { UserModel } from '../user';
import { formatResponse, jwt } from '../../util';
import constants from '../../constants';

const {
  OK, NOT_FOUND, INTERNAL_SERVER_ERROR, UNAUTHORIZED
} = StatusCodes;

/**
 * login
 *
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
        return res.status(NOT_FOUND).send(
          formatResponse('Username doesn\'t exist', true, NOT_FOUND)
        );
      }

      // handle wrong password
      return user.comparePassword(password, (err, isMatch) => {
        if (err) throw err;

        if (isMatch) {
          // generate refresh and access token then send it
          // do not use username from payload just in case there's a mismatch with data in db
          const tokenPayload = { userId: user._id, username: user.username, roles: user.roles };

          return res
            .cookie('refreshToken', jwt.generateRefreshToken(tokenPayload), constants.cookieOptions(false))
            .status(OK)
            .send(formatResponse('Successfully login', true, undefined, {
              token: jwt.generateAccessToken(tokenPayload)
            }));
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
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling refresh access token
 */
const refresh = (req, res) => {
  const { userId, username, roles } = req;
  const tokenPayload = { userId, username, roles };

  res
    .status(OK)
    .send(formatResponse('Successfully refresh token', true, undefined, { token: jwt.generateAccessToken(tokenPayload) }));
};

/**
 * logout
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling logout and remove cookie
 */
const logout = (req, res) => res
  .cookie('refreshToken', '', constants.cookieOptions(true))
  .status(OK)
  .send(formatResponse('Successfully logout', true));

export default {
  login,
  refresh,
  logout
};
