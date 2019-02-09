// const winston = require('../config/winston');
const winston = require('winston');

module.exports = function(err, req, res, next) {
  winston.error(err.message, err);
  // winston.error(
  //   `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
  //     req.method
  //   } - ${req.ip}`
  // );
  res.status(500).send('Something went wrong.');
};
