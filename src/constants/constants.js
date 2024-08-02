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
  COUNSELOR: 'counselor',
  ADMIN: 'admin',
  USER_ROLE: ['admin', 'counselor', 'user'],
  COUNSELOR_ROLE_ONLY: ['admin', 'counselor'],
  ADMIN_ROLE_ONLY: ['admin'],

  // auth related
  cookieOptions: (signOut) => ({
    maxAge: signOut ? 0 : 8 * 60 * 60 * 1000,
    httpOnly: true,
    // CANDRA : NEED TO RUN ON LOCAL , IT SHOULD BE STRICT
    secure: true,
    sameSite: 'None'
  }),

  // modules
  LOCKED: 0,
  UNLOCKED: 1,
  IN_PROGRESS: 2,
  FINISHED: 3,
  INTERVENTION_MODULE: 'MI',
  ASSIGNMENT_MODULE: 'MA',
  INTRO_MODULE: 0,
  FIRST_MODULE: 1,
  MODULE_SEPARATOR: '_'
};
