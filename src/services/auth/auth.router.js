import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import constant from '../../constant';
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
 * routes for refreshing token
 */
router
  .route('/refresh')
  .post(authenticate.refresh, AuthController.refresh);

/**
 * routes for ping logged in user
 */
router
  .route('/ping')
  .get(authenticate.auth(constant.userRole), (req, res) => res.status(StatusCodes.OK).send(formatResponse('pong, authorized.', true)));

export default router;
