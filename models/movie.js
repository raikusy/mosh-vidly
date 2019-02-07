const Joi = require('joi');
const mongoose = require('mongoose');

const { genresSchema } = require('./genre');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 255
  },
  numberInStock: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 255
  },
  dailyRentalRate: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 255
  },
  genre: { type: genresSchema, required: true }
});

const Movie = mongoose.model('Movie', movieSchema);

// Validate
function validateMovie(movie) {
  const schema = {
    title: Joi.string()
      .min(5)
      .max(255)
      .required(),
    numberInStock: Joi.number(),
    dailyRentalRate: Joi.number(),
    genreId: Joi.string().required()
  };
  return Joi.validate(movie, schema);
}

exports.Movie = Movie;
exports.validate = validateMovie;
