import { Router } from 'express';

import { authenticate, validate } from '../../middlewares';
import UserController from './user.controller';
import UserValidation from './user.validation';
import constants from '../../constants';

const { ADMIN_ROLE_ONLY, COUNSELOR_ROLE_ONLY, USER_ROLE } = constants;

const router = Router();

/**
 * routes for get all user
 */
router
  .route('/')
  .get(
    validate(UserValidation.get),
    authenticate.auth(ADMIN_ROLE_ONLY),
    UserController.get(false)
  );

/**
 * routes for get all student from counselor
 */
router
  .route('/students')
  .get(
    authenticate.auth(COUNSELOR_ROLE_ONLY),
    UserController.get(true)
  );

/**
 * routes for ping logged in user
 */
router
  .route('/modules')
  .get(authenticate.auth(USER_ROLE), UserController.getModules);

/**
 * routes for register new
 */
router
  .route('/register')
  .post(
    // validate(UserValidation.register),
    // CANDRA: temporarely disabled for stagin deployment
    // authenticate.auth(ADMIN_ROLE_ONLY), 
    UserController.create
  );

/**
 * routes for update intro
 */
router
  .route('/updateIntro')
  .post(
    authenticate.auth(USER_ROLE),
    UserController.updateIntro
  );

/**
 * routes for update user modules
 */
router
  .route('/updateModules')
  .patch(
    validate(UserValidation.updateModules),
    authenticate.auth(COUNSELOR_ROLE_ONLY),
    UserController.updateModules
  );

/**
 * routes for update user modules
 */
router
  .route('/updateCounselor')
  .patch(
    validate(UserValidation.updateCounselor),
    authenticate.auth(ADMIN_ROLE_ONLY),
    UserController.updateCounselor
  );

export default router;
