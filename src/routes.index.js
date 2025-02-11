import express from 'express';

import {
  AuthRouter,
  AssignmentRouter,
  ModuleRouter,
  UserRouter,
  InvitationRouter,
  RestoreRouter
} from './services/index.js';

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
    path: '/assignment',
    route: AssignmentRouter
  },
  {
    path: '/module',
    route: ModuleRouter
  },
  {
    path: '/user',
    route: UserRouter
  },
  {
    path: '/invitation',
    route: InvitationRouter
  },
  {
    path: '/restore',
    route: RestoreRouter
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
