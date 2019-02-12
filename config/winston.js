const { format, createLogger, transports } = require('winston');
const { logLevel } = require('./config');

const {
  combine, json, colorize, simple, timestamp,
} = format;

const logger = createLogger({
  level: logLevel || 'info',
  transports: [new transports.Console()],
  format: combine(colorize(), simple()),
});

const errorLogger = createLogger({
  transports: [new transports.Console()],
  exitOnError: false,
  format: combine(timestamp(), json()),
});

module.exports = { logger, errorLogger };
