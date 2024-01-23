import { Router } from 'express';

import UserController from './controller';

const router = Router();

router
  .route('/')
  .get(UserController.get)
  .post(UserController.create);

router
  .route('/:id')
  .delete(UserController.remove);

export default router;
