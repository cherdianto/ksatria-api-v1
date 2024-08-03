/* eslint-disable */

import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';

import { UserModel } from '../user';
import TokenModel from '../token/token.model';
import { formatResponse, jwt } from '../../util';
import constants from '../../constants';

const {
  OK, NOT_FOUND, INTERNAL_SERVER_ERROR, UNAUTHORIZED
} = StatusCodes;

function _generateToken() {
  const buffer = crypto.randomBytes(32);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

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

  return res
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

/**
 * validate reset password link
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling reset password link
 */
const validateResetPasswordLink = (req, res) => {
  const { token } = req.query;

  TokenModel.findOne({ token })
    .then((dataToken) => {
      if (new Date(dataToken.expiryAt) < Date.now()) {
        return res.status(UNAUTHORIZED).send(
          formatResponse('Token is expired', true, UNAUTHORIZED)
        );
      }

      return res.status(OK).send(
        formatResponse('Successfully confirm token validity', true, undefined, { dataToken })
      );
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
    });
};

/**
 * generate reset password
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling generation of reset link
 */
const generateResetPasswordLink = (req, res) => {
  const { email } = req.body;

  UserModel.findOne({ email })
    .then(async () => {
      const expiryAt = new Date();
      expiryAt.setMinutes(expiryAt.getMinutes() + 15);

      await TokenModel.create({
        email,
        token: _generateToken(),
        expiryAt
      });

      // SEND RESET LINK TO USER EMAIL
      // const resetPasswordLink = `${API_URL}/v1/auth/rst?token=${newToken.token}`;
      // // Replace with actual sending logic
      // await sendEmail({
      //   recipientEmail: email,
      //   subject: 'Reset Password Ksatria Project',
      //   templateType: 'reset_password',
      //   dynamicData: { resetPasswordLink },
      // });

      res.status(OK).send(
        formatResponse('Successfully generate reset password link', true, undefined)
      );
    }).catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
    });
};

/**
 * change password with token
 *
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @returns controller to handling reset password link
 */
const changePasswordWithToken = (req, res) => {
  const { newPassword, token } = req.body;

  TokenModel.findOne({ token })
    .then(async (dataToken) => {
      if (new Date(dataToken.expiryAt) < Date.now()) {
        return res.status(UNAUTHORIZED).send(
          formatResponse('Token is expired', true, UNAUTHORIZED)
        );
      }

      const user = await UserModel.findOne({ email: dataToken.email })

      if(!user){
        res.status(NOT_FOUND).send(
          formatResponse('User not found in the database', 200, NOT_FOUND)
        )
      }

      user.password = newPassword
      await user.save()

      await TokenModel.deleteOne({token})

      return res.status(OK).send(
        formatResponse('Successfully change user password', true, undefined)
      );
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send(formatResponse(err.message, false));
    });
};

export default {
  login,
  refresh,
  logout,
  generateResetPasswordLink,
  validateResetPasswordLink,
  changePasswordWithToken
};
