// const winston = require('winston');
// require('winston-mongodb');

// const logger = winston.createLogger({
//   level: 'error',
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.Console({
//       level: 'debug',
//       handleExceptions: true,
//       json: false,
//       colorize: true
//     }),
//     new winston.transports.File({ level: 'error', filename: 'logfile.log' })
//   ],
//   exitOnError: false
// });

// logger.add(winston.transports.MongoDb, { db: 'mongodb://localhost/vidly' });

// module.exports = logger;
