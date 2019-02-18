const winston = require('winston');
const express = require('express');
const app = express();

require('./startup/logger.js')();
require('./startup/db')();
require('./startup/routes')(app);
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);

// Listen to port 3000
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () =>
  winston.info(`Listening on port ${PORT}`)
);

module.exports = server;
