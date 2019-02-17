const express = require('express');
const router = express.Router();
const Fawn = require('fawn');
const mongoose = require('mongoose');

const { Rental, validate } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');

Fawn.init(mongoose);

// Get all rentals
router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut');
  res.send(rentals);
});

// Get one rental
router.get('/:id', validateObjectId, async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) return res.status(404).send('No rental found');

  res.send(rental);
});

// Create rental
router.post('/', authMiddleware, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send('Invalid customer');

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send('Invalid movie');

  if (movie.numberInStock === 0)
    return res.status(400).send('Movie not in stock');

  const rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    }
  });
  // await rental.save();
  try {
    const task = new Fawn.Task();
    await task
      .save('rentals', rental)
      .update(
        'movies',
        { _id: movie._id },
        {
          $inc: { numberInStock: -1 }
        }
      )
      .run();
    res.send(rental);
  } catch (err) {
    res.status(500).send('Something failed');
  }
});

// TODO:
// Edit rental
router.put('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const rental = await Rental.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, phone: req.body.phone, isGold: req.body.isGold },
    { new: true }
  );

  if (!rental) return res.status(404).send('No rental found');

  res.send(rental);
});

// Delete rental
router.delete('/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  const rental = await Rental.findByIdAndRemove(req.params.id);

  if (!rental) return res.status(404).send('No rental found');

  res.send(rental);
});

module.exports = router;
