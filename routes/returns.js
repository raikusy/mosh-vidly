const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const moment = require('moment');

router.post('/', authMiddleware, async (req, res) => {
  if (!req.body.customerId)
    return res.status(400).send('No Customer Id Provided');
  if (!req.body.movieId) return res.status(400).send('No Movie Id Provided');
  const rental = await Rental.findOne({
    'customer._id': req.body.customerId,
    'movie._id': req.body.movieId
  });
  // console.log(rental);
  if (!rental) return res.status(404).send('No Movie Found');

  if (rental.dateReturned)
    return res.status(400).send('Rental already processed');

  rental.dateReturned = new Date();
  const rentalDays = moment().diff(rental.dateOut, 'days');

  rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;

  await rental.save();

  await Movie.updateOne(
    { _id: req.body.movieId },
    {
      $inc: {
        numberInStock: 1
      }
    }
  );

  res.status(200).send(rental);
});

module.exports = router;
