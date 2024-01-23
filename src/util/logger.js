import getLogger from 'loglevel-colored-level-prefix';

/**
 * setup 1 logger for server
 */
const options = { prefix: 'ksatira-server', level: 'trace' };
const logger = getLogger(options);

export default logger;
