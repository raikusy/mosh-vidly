const winston = require('winston');
require('express-async-errors');
require('winston-mongodb');

module.exports = function() {
  winston.handleExceptions(
    new winston.transports.File({ filename: 'uncaught.log' })
  );

  process.on('unhandledRejection', ex => {
    throw ex;
  });

  winston.add(winston.transports.File, { filename: 'logfile.log' });
  winston.add(winston.transports.MongoDB, {
    db: 'mongodb://localhost/vidly',
    level: 'error'
  });
};
