const Joi = require('joi');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  isGold: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 15,
    unique: true
  }
});

const Customer = mongoose.model('Customer', customerSchema);
// Genres Database
// const genres = [{ id: 1, name: 'Action' }, { id: 2, name: 'Horror' }];

// Get all genres
router.get('/', async (req, res) => {
  const customers = await Customer.find().sort('name');
  res.send(customers);
});

// Get one genre
router.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) return res.status(404).send('No customer found');

  res.send(customer);
});

// Create genre
router.post('/', async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    let customer = new Customer({
      name: req.body.name,
      phone: req.body.phone,
      isGold: req.body.isGold
    });
    customer = await customer.save();
    res.send(customer);
  } catch (err) {
    res.status(400).send(err.errmsg);
  }
});

// Edit genre
router.put('/:id', async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, phone: req.body.phone, isGold: req.body.isGold },
    { new: true }
  );

  if (!customer) return res.status(404).send('No customer found');

  res.send(customer);
});

// Delete genre
router.delete('/:id', async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer) return res.status(404).send('No customer found');

  res.send(customer);
});

// Validate
function validateCustomer(customer) {
  const schema = {
    name: Joi.string()
      .min(5)
      .max(255)
      .required(),
    phone: Joi.string()
      .min(8)
      .max(15)
      .required(),
    isGold: Joi.boolean()
  };
  return Joi.validate(customer, schema);
}

module.exports = router;
