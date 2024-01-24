import { Router } from 'express';

import { authenticate, validate } from '../../middlewares';
import UserController from './user.controller';
import UserValidation from './user.validation';
import constant from '../../constant';

const router = Router();

// register new user routes
router
  .route('/register')
  .post(
    validate(UserValidation.register),
    authenticate(constant.rootRoleOnly),
    UserController.create
  );

export default router;
