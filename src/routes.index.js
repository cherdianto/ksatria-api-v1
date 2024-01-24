import express from 'express';

import { AuthRouter, UserRouter } from './services';

/**
 * express router
 * @constant
 */
const router = express.Router();

/**
 * all routes lists
 * @constant
 */
const defaultRoutes = [
  {
    path: '/auth',
    route: AuthRouter
  },
  {
    path: '/user',
    route: UserRouter
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
