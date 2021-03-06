const winston = require('winston');
require('express-async-errors');
require('winston-mongodb');
const config = require('config');

module.exports = function() {
  winston.handleExceptions(
    new winston.transports.File({ filename: 'uncaught.log' })
  );

  process.on('unhandledRejection', ex => {
    throw ex;
  });

  winston.add(winston.transports.File, { filename: 'logfile.log' });
  winston.add(winston.transports.MongoDB, {
    db: config.get('db'),
    level: 'error'
  });
};
