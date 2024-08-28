import { Router } from 'express';

import { authenticate, validate } from '../../middlewares';
import UserController from './user.controller';
import UserValidation from './user.validation';
import constants from '../../constants';

const {
  ADMIN_ROLE_ONLY,
  COUNSELOR_ROLE_ONLY,
  USER_ROLE,
  PSYCHOLOGIST_ROLE_ONLY,
  COUNSELOR_PSYCHOLOGIST_ROLE_ONLY
} = constants;

const router = Router();

/**
 * routes for user get his own data
 */
router.route('/').get(
  // validate(UserValidation.get),
  authenticate.auth(USER_ROLE),
  UserController.getUserData
);

/**
 * routes for admin to get all user
 */
router
  .route('/get-all')
  .get(authenticate.auth(ADMIN_ROLE_ONLY), UserController.adminGetAll);

/**
 * routes for get all user
 */
router
  .route('/students-by-psychologist')
  .get(
    validate(UserValidation.get),
    authenticate.auth(PSYCHOLOGIST_ROLE_ONLY),
    UserController.getStudentsByPsychologist
  );

/**
 * routes for get all user
 */
router
  .route('/students')
  .get(
    validate(UserValidation.get),
    authenticate.auth(COUNSELOR_PSYCHOLOGIST_ROLE_ONLY),
    UserController.getStudents
  );

/**
 * routes for get all counselors
 */
router.route('/counselors').get(
  // validate(UserValidation.get),
  authenticate.auth(USER_ROLE),
  UserController.getCounselors
);

/**
 * routes for get all counselors
 */
router.route('/psychologists').get(
  // validate(UserValidation.get),
  authenticate.auth(USER_ROLE),
  UserController.getPsychologists
);

/**
 * routes for update user data by user
 */
router.route('/user-update').post(
  // validate(UserValidation.get),
  authenticate.auth(USER_ROLE),
  UserController.updateUserProfile
);

/**
 * routes for update user data by admin
 */
router.route('/admin-update').post(
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
