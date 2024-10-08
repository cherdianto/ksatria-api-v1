import { Router } from 'express';

import { authenticate, validate } from '../../middlewares';
import UserController from './user.controller';
import UserValidation from './user.validation';
import constants from '../../constants';

const { ADMIN_ROLE_ONLY, COUNSELOR_ROLE_ONLY, USER_ROLE } = constants;

const router = Router();


/**
 * routes for user get his own data
 */
router
.route('/')
.get(
  // validate(UserValidation.get),
  authenticate.auth(USER_ROLE),
  UserController.getUserData
);

/**
 * routes for admin to get all user
 */
router.route('/get-all').get(
  authenticate.auth(ADMIN_ROLE_ONLY),
  UserController.adminGetAll
);

/**
 * routes for get all user
 */
router
  .route('/students')
  .get(
    validate(UserValidation.get),
    authenticate.auth(ADMIN_ROLE_ONLY),
    UserController.getStudents(false)
  );

/**
 * routes for update user data by user
 */
router
.route('/user-update')
.post(
  // validate(UserValidation.get),
  authenticate.auth(USER_ROLE),
  UserController.updateUserProfile
);

/**
 * routes for update user data by admin
 */
router
.route('/admin-update')
.post(
  // validate(UserValidation.get),
  authenticate.auth(ADMIN_ROLE_ONLY),
  UserController.adminUpdateUserData
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
router.route('/register').post(
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
  .post(authenticate.auth(USER_ROLE), UserController.updateIntro);

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
