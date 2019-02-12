const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

// eslint-disable-next-line consistent-return
function auth(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(httpStatus.UNAUTHORIZED).json();
  }

  const token = req.headers.authorization.split(' ');

  if (token.length !== 2 || token[0] !== 'Bearer') {
    return res.status(httpStatus.UNAUTHORIZED).json();
  }

  jwt.verify(token[1], config.publicKey, { algorithms: ['RS512'] }, (err, decoded) => {
    if (err) {
      return res.status(httpStatus.UNAUTHORIZED).json();
    }
    req.user = decoded; // eslint-disable-line no-param-reassign
    return next();
  });
}

module.exports = auth;
