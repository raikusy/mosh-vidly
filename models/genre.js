const Joi = require('joi');
const mongoose = require('mongoose');

const genresSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 55
  }
});

const Genre = mongoose.model('Genre', genresSchema);

// Validate
function validateGenre(genre) {
  const schema = {
    name: Joi.string()
      .min(3)
      .required()
  };
  return Joi.validate(genre, schema);
}

exports.Genre = Genre;
exports.validate = validateGenre;
