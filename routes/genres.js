const express = require('express');
const router = express.Router();

const { Genre, validate } = require('../models/genre');
const authMiddleware = require('../middleware/auth');

// Get all genres
router.get('/', async (req, res) => {
  const genres = await Genre.find().sort('name');
  res.send(genres);
});

// Get one genre
router.get('/:id', async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) return res.status(404).send('No genre found');

  res.send(genre);
});

// Create genre
router.post('/', authMiddleware, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = new Genre({
    name: req.body.name
  });
  await genre.save();
  res.send(genre);
});

// Edit genre
router.put('/:id', authMiddleware, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  if (!genre) return res.status(404).send('No genre found');

  res.send(genre);
});

// Delete genre
router.delete('/:id', authMiddleware, async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);

  if (!genre) return res.status(404).send('No genre found');

  res.send(genre);
});

module.exports = router;
