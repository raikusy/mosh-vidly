const express = require('express');
const router = express.Router();

const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const validateMovie = require('../middleware/validate');

// Get all movies
router.get('/', async (req, res) => {
  const movies = await Movie.find().sort('name');
  res.send(movies);
});

// Get one movie
router.get('/:id', validateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) return res.status(404).send('No movie found');

  res.send(movie);
});

// Create movie
router.post(
  '/',
  [authMiddleware, validateMovie(validate)],
  async (req, res) => {
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send('Invalid Genre.');
    const movie = new Movie({
      title: req.body.title,
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
      genre: {
        _id: genre._id,
        name: genre.name
      }
    });
    await movie.save();
    res.send(movie);
  }
);

// Edit movie
router.put(
  '/:id',
  [authMiddleware, validateObjectId, validateMovie(validate)],
  async (req, res) => {
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send('Invalid Genre.');

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
        genre: { name: genre.name, _id: genre._id }
      },
      { new: true }
    );

    if (!movie) return res.status(404).send('No movie found');

    res.send(movie);
  }
);

// Delete movie
router.delete(
  '/:id',
  [authMiddleware, adminMiddleware, validateObjectId],
  async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);

    if (!movie) return res.status(404).send('No movie found');

    res.send(movie);
  }
);

module.exports = router;
