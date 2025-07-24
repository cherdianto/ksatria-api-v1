import { Router } from 'express';

import { authenticate, validate } from '../../middlewares/index.js';
import ModuleController from './module.controller.js';
import ModuleValidation from './module.validation.js';
import constants from '../../constants/index.js';

const { USER_ROLE, COUNSELOR_ROLE_ONLY, ADMIN_ROLE_ONLY, COUNSELOR_PSYCHOLOGIST_ROLE_ONLY } = constants;

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

router
.route('/update')
.post(
  authenticate.auth(ADMIN_ROLE_ONLY),
  ModuleController.update
);

router
  .route('/')
  .get(
    // validate(ModuleValidation.getModule),
    authenticate.auth(USER_ROLE),
    ModuleController.get(false)
  );

router
.route('/detail')
.get(
  validate(ModuleValidation.getModule),
  authenticate.auth(ADMIN_ROLE_ONLY),
  ModuleController.getDetailModule
);

router.route('/all').get(
  authenticate.auth(USER_ROLE),
  ModuleController.getAll
);

router
  .route('/students')
  .get(
    validate(ModuleValidation.getStudentModule),
    authenticate.auth(COUNSELOR_PSYCHOLOGIST_ROLE_ONLY),
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
