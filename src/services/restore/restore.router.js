import { Router } from 'express';
import { authenticate} from '../../middlewares/index.js';
import RestoreController from './restore.controller.js';
import constants from '../../constants/index.js';

const {ADMIN_ROLE_ONLY} = constants;
const router = Router();

router
  .route('/')
  .post(
    authenticate.auth(ADMIN_ROLE_ONLY),
    RestoreController.restore
  );

export default router;
