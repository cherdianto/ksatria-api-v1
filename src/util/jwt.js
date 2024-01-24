import jwt from 'jsonwebtoken';

import config from '../config';

/**
 * generateAccessToken
 *
 * @param {Object} payload - payload to sign in jwt
 * @returns access token
 */
const generateAccessToken = (payload) => jwt.sign(payload, config.secretKey, {
  algorithm: 'HS256',
  expiresIn: '30m'
});

/**
 * generateRefreshToken
 *
 * @param {Object} payload - payload to sign in jwt
 * @returns refresh token
 */
const generateRefreshToken = (payload) => jwt.sign(payload, config.secretKeyRefresh, {
  algorithm: 'HS256',
  expiresIn: '8h'
});

export default {
  generateAccessToken,
  generateRefreshToken
};
