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
  USER_ROLE: ['root', 'admin', 'user'],
  ADMIN_ROLE_ONLY: ['root', 'admin'],
  ROOT_ROLE_ONLY: ['root'],

  // auth related
  cookieOptions: (signOut) => ({
    maxAge: signOut ? 0 : 8 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict'
  })
};
