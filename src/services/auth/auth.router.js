/* eslint-disable */

import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import constants from '../../constants';
import { formatResponse } from '../../util';
import { validate, authenticate } from '../../middlewares';
import AuthController from './auth.controller';
import AuthValidation from './auth.validation';

const router = Router();

/**
 * routes for log in
 */
router
  .route('/login')
  .post(validate(AuthValidation.login), AuthController.login);

/**
 * routes for logout user
 */
router
  .route('/logout')
  .post(authenticate.auth(constants.USER_ROLE), AuthController.logout);

/**
 * routes for ping logged in user
 */
router
  .route('/refresh')
  .post(authenticate.refresh, AuthController.refresh);

/**
 * routes for ping logged in user
 */
router
  .route('/ping')
  .get(authenticate.auth(constants.USER_ROLE), (req, res) => res.status(StatusCodes.OK).send(formatResponse('pong, authorized.', true)));

/**
 * routes for generate reset password link
 */
router
  .route('/reset-password')
  .post(validate(AuthValidation.generateResetPasswordLink), AuthController.generateResetPasswordLink);

/**
 * routes for validate reset password link
 */
router
  .route('/validate-reset')
  .post(validate(AuthValidation.validateResetPasswordLink), AuthController.validateResetPasswordLink);


  /**
 * routes for change password with token
 */
router
.route('/change-password')
.post(validate(AuthValidation.changePasswordWithToken), AuthController.changePasswordWithToken);

export default router;
