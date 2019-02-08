const express = require('express');
const router = express.Router();
const Fawn = require('fawn');
const mongoose = require('mongoose');

const { Rental, validate } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const authMiddleware = require('../middleware/auth');

Fawn.init(mongoose);

// Get all rentals
router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut');
  res.send(rentals);
});

// Get one customer
router.get('/:id', async (req, res) => {
  const customer = await Rental.findById(req.params.id);

  if (!customer) return res.status(404).send('No customer found');

  res.send(customer);
});

// Create customer
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
  try {
    new Fawn.Task()
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

// Edit customer
router.put('/:id', authMiddleware, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Rental.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, phone: req.body.phone, isGold: req.body.isGold },
    { new: true }
  );

  if (!customer) return res.status(404).send('No customer found');

  res.send(customer);
});

// Delete customer
router.delete('/:id', authMiddleware, async (req, res) => {
  const customer = await Rental.findByIdAndRemove(req.params.id);

  if (!customer) return res.status(404).send('No customer found');

  res.send(customer);
});

module.exports = router;
