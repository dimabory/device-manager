const Promise = require('bluebird');

const pgp = require('pg-promise')({
  promiseLib: Promise,
});

const config = require('../config/config');

module.exports = pgp({ connectionString: config.db });
