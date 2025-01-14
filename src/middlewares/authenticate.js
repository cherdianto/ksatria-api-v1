import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import config from '../config.js';
import { formatResponse, logger } from '../util/index.js';

const { UNAUTHORIZED, FORBIDDEN } = StatusCodes;

const _checkRefreshToken = (req) => {
  const refreshToken = req.cookies?.refreshToken;
  logger.info('refreshToken ' + refreshToken)

  if (!refreshToken) throw new Error('Access denied. No refresh token provided.');

  return jwt.verify(refreshToken, config.secretKeyRefresh);
};


const refresh = (req, res, next) => {
  try {
    const { userId, username, roles, email } = _checkRefreshToken(req);
    req.userId = userId;
    req.username = username;
    req.roles = roles;
    req.email = email;
    next();
  } catch (error) {
    logger.error('Failed to Authorized', error);

    res.status(UNAUTHORIZED).send(formatResponse('Unauthorized', false, UNAUTHORIZED));
  }
};

const auth = (allowedRoles) => async (req, res, next) => {
  const accessToken = req.headers?.authorization?.split(' ')[1];

  if (!accessToken) return res.status(UNAUTHORIZED).send(formatResponse('Access denied. No access token provided.', false, UNAUTHORIZED));

  try {
    await _checkRefreshToken(req, res);
    // get username and roles
    const { userId, username, roles } = jwt.verify(accessToken, config.secretKey);

    if (!allowedRoles.includes(roles)) return res.status(FORBIDDEN).send(formatResponse('Access denied.', false, FORBIDDEN));

    req.roles = roles;
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
