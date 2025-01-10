import { Router } from 'express';

import { authenticate, validate } from '../../middlewares/index.js';
import AssignmentController from './assignment.controller.js';
import AssignmentValidation from './assignment.validation.js';
import constants from '../../constants/index.js';

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

  router
  .route('/overall-feedback')
  .post(
    validate(AssignmentValidation.overallFeedback),
    authenticate.auth(COUNSELOR_ROLE_ONLY),
    AssignmentController.overallFeedback
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

router.route('/allAssignment').get(
  authenticate.auth(USER_ROLE),
  AssignmentController.getAllAssignment
);


export default router;
