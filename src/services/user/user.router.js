import { Router } from 'express';

import { authenticate, validate } from '../../middlewares';
import UserController from './user.controller';
import UserValidation from './user.validation';
import constants from '../../constants';

const { ROOT_ROLE_ONLY, USER_ROLE } = constants;

const router = Router();

/**
 * routes for register new
 */
router
  .route('/register')
  .post(
    validate(UserValidation.register),
    authenticate.auth(ROOT_ROLE_ONLY),
    UserController.create
  );

/**
 * routes for ping logged in user
 */
router
  .route('/modules')
  .get(authenticate.auth(USER_ROLE), UserController.getModules);

export default router;
