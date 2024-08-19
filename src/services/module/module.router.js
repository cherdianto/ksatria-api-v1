import { Router } from 'express';

import { authenticate, validate } from '../../middlewares';
import ModuleController from './module.controller';
import ModuleValidation from './module.validation';
import constants from '../../constants';

const { USER_ROLE, COUNSELOR_ROLE_ONLY, ADMIN_ROLE_ONLY } = constants;

const router = Router();

/**
 * routes for register new modules
 */
router
  .route('/register')
  .post(
    // validate(ModuleValidation.register),
    authenticate.auth(ADMIN_ROLE_ONLY),
    ModuleController.create
  );

/**
 * routes for get spesific modules
 */
router
  .route('/')
  .get(
    validate(ModuleValidation.getModule),
    authenticate.auth(USER_ROLE),
    ModuleController.get(false)
  );

  /**
 * routes for get spesific modules
 */
router
.route('/detail')
.get(
  validate(ModuleValidation.getModule),
  authenticate.auth(ADMIN_ROLE_ONLY),
  ModuleController.getDetailModule
);

/**
 * routes for get all modules
 */
router.route('/all').get(
  authenticate.auth(USER_ROLE),
  ModuleController.getAll
);

/**
 * routes for get spesific student modules
 */
router
  .route('/students')
  .get(
    validate(ModuleValidation.getStudentModule),
    authenticate.auth(COUNSELOR_ROLE_ONLY),
    ModuleController.get(true)
  );

/**
 * routes for delete specific module
 */
router
  .route('/delete/:moduleUUID')
  .delete(
    authenticate.auth(ADMIN_ROLE_ONLY),
    ModuleController.deleteModule
  );

export default router;
