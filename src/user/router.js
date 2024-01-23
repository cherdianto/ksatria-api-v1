import { Router } from 'express';

import UserController from './controller';
import Validation from './validation';
import { validate } from '../middlewares';

const router = Router();

router
  .route('/register')
  .post(validate(Validation.register), UserController.create);

export default router;
