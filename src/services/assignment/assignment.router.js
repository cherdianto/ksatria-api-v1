import { Router } from 'express';

import { authenticate, validate } from '../../middlewares';
import AssignmentController from './assignment.controller';
import AssignmentValidation from './assignment.validation';
import constants from '../../constants';

const { USER_ROLE, COUNSELOR_ROLE_ONLY } = constants;

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
  .route('/feedback')
  .post(
    validate(AssignmentValidation.feedback),
    authenticate.auth(COUNSELOR_ROLE_ONLY),
    AssignmentController.feedback
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

  /**
 * routes for get all assignment
 */
router.route('/all').get(
  authenticate.auth(USER_ROLE),
  AssignmentController.getAll
);


export default router;
