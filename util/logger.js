import { createRollingFileLogger } from 'simple-node-logger';

const opts = {
  logDirectory: process.env.LOGS_DIRECTORY,
  fileNamePattern: 'roll-<DATE>.log',
  dateFormat: 'YYYY-MM-DD',
};

const logger = createRollingFileLogger(opts);

export const info = text => {
  logger.info(text);
};

export const error = text => {
  logger.error(text);
};