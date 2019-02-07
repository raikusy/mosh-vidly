const Joi = require('joi');
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

exports.Customer = Customer;
exports.validate = validateCustomer;
