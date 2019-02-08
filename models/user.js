const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

// TODO
// const PasswordComplexity = require('joi-password-complexity');
// const complexityOptions = {
//   min: 5,
//   max: 30,
//   lowerCase: 1,
//   numeric: 1
// };

// Joi.validate(
//   '123!',
//   new PasswordComplexity(complexityOptions),
//   (err, value) => {
//     console.log(err, value);
//   }
// );

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 255,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  isAdmin: { type: Boolean, default: false }
});

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get('jwtPrivateKey')
  );
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string()
      .min(5)
      .max(255)
      .required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
  };
  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
