const express = require('express');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('http-status');
const expressWinston = require('express-winston');
const expressValidation = require('express-validation');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const { logger, errorLogger } = require('./winston');
const routes = require('../index.route');
const { env } = require('./config');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(compress());
app.use(methodOverride());
app.use(helmet());
app.use(cors());

// enable detailed API logging in dev env
if (env === 'development') {
  app.use(expressWinston.logger({ winstonInstance: logger, expressFormat: true }));
}

// Swagger UI documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(require('../docs/swagger.json'), {
  customCss: '.swagger-ui .topbar, .swagger-ui .models { display: none };',
}));

// mount all routes on /api path
app.use('/api', routes);

// error logging
if (env !== 'test') {
  app.use(expressWinston.errorLogger({ winstonInstance: errorLogger }));
}

// error handlers
app.use([clientErrorHandler, errorHandler]);

app.use((req, res) => res.status(NOT_FOUND).json({ message: 'not found' }));

module.exports = app;

/*
 * Client Error Handler
 */
function clientErrorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof expressValidation.ValidationError) {
    return res.status(BAD_REQUEST).json({
      message: err.errors.map(error => error.messages.join('. ')).join(' and '),
    });
  }

  if (err.status === BAD_REQUEST) return res.status(err.status).json({ message: err.message });
  if (err.status === NOT_FOUND) return res.status(err.status).json({ message: 'not found' });

  return next(err);
}

/*
 * General Error Handler
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.warn(err.stack); // eslint-disable-line no-console
  return res.status(INTERNAL_SERVER_ERROR).json({ message: 'internal server error' });
}
