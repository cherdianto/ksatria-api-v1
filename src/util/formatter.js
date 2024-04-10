import { StatusCodes } from 'http-status-codes';

/**
 * formatter for response
 *
 * @param {string} message - response message
 * @param {boolean} success - success or error
 * @param {StatusCodes} message - response message
 * @param {string} data - response data
 *
 * @returns response formatter
 */
const formatResponse = (
  message,
  success = true,
  errCode = null,
  data = {}
) => ({
  success,
  message,
  errorCode: errCode || (success ? null : StatusCodes.INTERNAL_SERVER_ERROR),
  data
});

export default formatResponse;
