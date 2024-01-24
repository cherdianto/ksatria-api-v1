import { Router } from 'express';

import { validate } from '../../middlewares';
import AuthController from './auth.controller';
import AuthValidation from './auth.validation';

const router = Router();

// login routes
router
  .route('/login')
  .post(validate(AuthValidation.login), AuthController.login);

// router
//   .route('/signout')
//   .get(UserController.get);

export default router;
