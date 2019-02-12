/**
 * Ensure all necessary environment variables are defined
 * (see required in .env.example)
 */
require('dotenv-safe').config();

const {
  NODE_ENV: env = 'development', PORT: port = 3000, DATABASE_URL: db, PUBLIC_KEY: publicKey, LOG_LEVEL: logLevel = 'info',
} = process.env;

module.exports = {
  env, port, db, publicKey: publicKey.replace(/\\n/g, '\n'), logLevel,
};
