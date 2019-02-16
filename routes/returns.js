const express = require('express');
const router = express.Router();
const Joi = require('joi');
const authMiddleware = require('../middleware/auth');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const validate = require('../middleware/validate');

router.post(
  '/',
  [authMiddleware, validate(validateReturns)],
  async (req, res) => {
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if (!rental) return res.status(404).send('No Movie Found');

    if (rental.dateReturned)
      return res.status(400).send('Rental already processed');

    rental.return();

    await rental.save();

    await Movie.updateOne(
      { _id: req.body.movieId },
      {
        $inc: {
          numberInStock: 1
        }
      }
    );

    res.send(rental);
  }
);

function validateReturns(req) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  };
  return Joi.validate(req, schema);
}

module.exports = router;
