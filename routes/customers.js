const express = require('express');
const router = express.Router();

const { Customer, validate } = require('../models/customer');
const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateCustomers = require('../middleware/validate');

// Get all customers
router.get('/', async (req, res) => {
  const customers = await Customer.find().sort('name');
  res.send(customers);
});

// Get one customer
router.get('/:id', validateObjectId, async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) return res.status(404).send('No customer found');

  res.send(customer);
});

// Create customer
router.post('/', validateCustomers(validate), async (req, res) => {
  const customer = new Customer({
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold
  });
  await customer.save();
  res.send(customer);
});

// Edit customer
router.put(
  '/:id',
  [validateObjectId, validateCustomers(validate)],
  async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, phone: req.body.phone, isGold: req.body.isGold },
      { new: true }
    );

    if (!customer) return res.status(404).send('No customer found');

    res.send(customer);
  }
);

// Delete customer
router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
  const customer = await Customer.findByIdAndRemove(req.params.id);

  if (!customer) return res.status(404).send('No customer found');

  res.send(customer);
});

module.exports = router;
