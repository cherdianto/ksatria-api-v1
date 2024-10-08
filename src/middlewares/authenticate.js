import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

import config from '../config';
import { formatResponse, logger } from '../util';

const { UNAUTHORIZED, FORBIDDEN } = StatusCodes;

/**
 * checkRefreshToken
 * @param {Object} req - express req
 *
 * @returns function to check refresh token
 * @private
 */
const _checkRefreshToken = (req) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) throw new Error('Access denied. No refresh token provided.');

  return jwt.verify(refreshToken, config.secretKeyRefresh);
};

/**
 * authenticate middleware
 * @param {String[]} allowedRoles - allowed roles to access the routes
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @param {Object} next - express next
 *
 * @returns middleware to check if user can access the route
 */
const refresh = (req, res, next) => {
  try {
    const { userId, username, roles } = _checkRefreshToken(req);
    req.userId = userId;
    req.username = username;
    req.roles = roles;
    next();
  } catch (error) {
    logger.error('Failed to Authorized', error);

    res.status(UNAUTHORIZED).send(formatResponse('Unauthorized', false, UNAUTHORIZED));
  }
};

/**
 * authenticate middleware
 * @param {String[]} allowedRoles - allowed roles to access the routes
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @param {Object} next - express next
 *
 * @returns middleware to check if user can access the route
 */
const auth = (allowedRoles) => async (req, res, next) => {
  const accessToken = req.headers?.authorization?.split(' ')[1];

  if (!accessToken) return res.status(UNAUTHORIZED).send(formatResponse('Access denied. No access token provided.', false, UNAUTHORIZED));

  try {
    await _checkRefreshToken(req, res);
    // get username and roles
    const { userId, username, roles } = jwt.verify(accessToken, config.secretKey);

    if (!allowedRoles.includes(roles)) return res.status(FORBIDDEN).send(formatResponse('Access denied.', false, FORBIDDEN));

    req.userId = userId;
    req.username = username;
    return next();
  } catch (error) {
    logger.error('Failed to Authorized', error);

    return res.status(UNAUTHORIZED).send(formatResponse('Unauthorized', false, UNAUTHORIZED));
  }
};

export default {
  auth,
  refresh
};
