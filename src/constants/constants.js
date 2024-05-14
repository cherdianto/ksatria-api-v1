/**
 * application constant
 * @constant
 */
export default {
  // default data
  DEFAULT_PORT: 8000,
  DEFAULT_SALT_FACTOR: 10,
  EMPTY_STRING: '',

  // role constant
  USER: 'user',
  ADMIN: 'admin',
  ROOT: 'root',
  USER_ROLE: ['root', 'admin', 'user'],
  ADMIN_ROLE_ONLY: ['root', 'admin'],
  ROOT_ROLE_ONLY: ['root'],

  // auth related
  cookieOptions: (signOut) => ({
    maxAge: signOut ? 0 : 8 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict'
  }),

  // modules
  LOCKED: 0,
  UNLOCKED: 1,
  IN_PROGRESS: 2,
  FINISHED: 3,
  INTERVENTION_MODULE: 'MI',
  ASSIGNMENT_MODULE: 'MA',
  INTRO_MODULE: 0,
  FIRST_MODULE: 1
};
