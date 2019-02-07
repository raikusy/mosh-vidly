const express = require('express');
const router = express.Router();

const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');

// Get all movies
router.get('/', async (req, res) => {
  const movies = await Movie.find().sort('name');
  res.send(movies);
});

// Get one movie
router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) return res.status(404).send('No movie found');

  res.send(movie);
});

// Create movie
router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid Genre.');
  try {
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
  } catch (err) {
    res.status(400).send(err.errmsg);
  }
});

// Edit movie
router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);

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
});

// Delete movie
router.delete('/:id', async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);

  if (!movie) return res.status(404).send('No movie found');

  res.send(movie);
});

module.exports = router;
