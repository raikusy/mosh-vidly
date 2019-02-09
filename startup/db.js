const mongoose = require('mongoose');
const winston = require('winston');
module.exports = function() {
  mongoose
    .connect('mongodb://localhost/vidly', { useNewUrlParser: true })
    .then(() => winston.info('MongoDB Connected Succesfully'));
};
