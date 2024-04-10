import { Router } from 'express';

import { authenticate, validate } from '../../middlewares';
import ModuleController from './module.controller';
import ModuleValidation from './module.validation';
import constants from '../../constants';

const { USER_ROLE, ROOT_ROLE_ONLY } = constants;

const router = Router();

/**
 * routes for register new modules
 */
router
  .route('/register')
  .post(
    validate(ModuleValidation.register),
    authenticate.auth(ROOT_ROLE_ONLY),
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
    ModuleController.get
  );

export default router;
