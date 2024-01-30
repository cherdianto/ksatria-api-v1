/**
 * application constant
 * @constant
 */
export default {
  userRole: ['root', 'admin', 'user'],
  adminRoleOnly: ['root', 'admin'],
  rootRoleOnly: ['root'],
  cookieOptions: (signOut) => ({
    maxAge: signOut ? 0 : 8 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'strict'
  })
};
