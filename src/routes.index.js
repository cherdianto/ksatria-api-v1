import express from 'express';

// import { AuthRouter } from './auth';
import { UserRouter } from './user';

/**
 * express router
 * @constant
 */
const router = express.Router();

const defaultRoutes = [
  // {
  //   path: '/',
  //   route: AuthRouter
  // },
  {
    path: '/user',
    route: UserRouter
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
