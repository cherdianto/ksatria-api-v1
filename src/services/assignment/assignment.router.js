import { Router } from 'express';

import { authenticate, validate } from '../../middlewares';
import AssignmentController from './assignment.controller';
import AssignmentValidation from './assignment.validation';
import constants from '../../constants';

const { USER_ROLE } = constants;

const router = Router();

/**
 * routes for save assignment
 */
router
  .route('/')
  .get(
    validate(AssignmentValidation.get),
    authenticate.auth(USER_ROLE),
    AssignmentController.get
  );

/**
 * routes for update intro
 */
router
  .route('/updateIntro')
  .post(
    authenticate.auth(USER_ROLE),
    AssignmentController.updateIntro
  );

/**
 * routes for save assignment
 */
router
  .route('/save')
  .post(
    validate(AssignmentValidation.save),
    authenticate.auth(USER_ROLE),
    AssignmentController.save
  );

/**
 * routes for save assignment
 */
router
  .route('/load')
  .get(
    validate(AssignmentValidation.load),
    authenticate.auth(USER_ROLE),
    AssignmentController.load
  );

export default router;
