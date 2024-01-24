import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

import config from '../config';
import { formatResponse } from '../util';

const { BAD_REQUEST, UNAUTHORIZED } = StatusCodes;

/**
 * authenticate middleware
 * @param {String[]} allowedRoles - allowed roles to access the routes
 * @param {Object} req - express req
 * @param {Object} res - express res
 * @param {Object} next - express next
 *
 * @returns middleware to check if user can access the route
 */
const authenticate = (allowedRoles) => (req, res, next) => {
  const accessToken = req.headers.authorization;

  if (!accessToken) return res.status(UNAUTHORIZED).send(formatResponse('Access denied. No token provided.', false, UNAUTHORIZED));

  try {
    // get username and roles
    const { username, roles } = jwt.verify(accessToken, config.secretKey);

    if (!allowedRoles.includes(roles)) return res.status(UNAUTHORIZED).send(formatResponse('Access denied.', false, UNAUTHORIZED));

    req.user = username;
    return next();
  } catch (error) {
    return res.status(BAD_REQUEST).send(formatResponse('Invalid token.', false, BAD_REQUEST));
  }
};

export default authenticate;
