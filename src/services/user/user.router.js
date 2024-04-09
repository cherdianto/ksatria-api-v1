import { Router } from 'express';

import { authenticate, validate } from '../../middlewares';
import UserController from './user.controller';
import UserValidation from './user.validation';
import constants from '../../constants';

const router = Router();

// register new user routes
router
  .route('/register')
  .post(
    validate(UserValidation.register),
    authenticate.auth(constants.ROOT_ROLE_ONLY),
    UserController.create
  );

export default router;
