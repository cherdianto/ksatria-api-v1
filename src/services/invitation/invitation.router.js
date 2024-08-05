import { Router } from 'express';

import { authenticate, validate } from '../../middlewares';
import constants from '../../constants';
import invitationController from './invitation.controller';

const { ADMIN_ROLE_ONLY } = constants;

const router = Router();

/**
 * routes for register new
 */
router
  .route('/bulk-invite')
  .post(
    // authenticate.auth(ADMIN_ROLE_ONLY), 
    invitationController.bulkCreate
  );

/**
 * routes for register new
 */
router
  .route('/invite')
  .post(
    authenticate.auth(ADMIN_ROLE_ONLY), 
    invitationController.invite
  );

/**
 * routes for register new user from 
 */
router
  .route('/register')
  .post(
    invitationController.registerUser
  );

  /**
 * routes for token invitation verification 
 */
router
.route('/verify')
.post(
  invitationController.verify
);

  /**
 * routes for get all invitations (paginated)
 */
  router
  .route('/get-all')
  .get(
    invitationController.getAllInvitations
  );

export default router;
