const Joi = require('joi');
const express = require('express');
const router = express.Router();

// Generes Database
const generes = [{ id: 1, name: 'Action' }, { id: 2, name: 'Horror' }];

// Get all generes
router.get('/', (req, res) => {
  res.send(generes);
});

// Get one genere
router.get('/:id', (req, res) => {
  const genere = generes.find(g => g.id === parseInt(req.params.id));
  if (!genere) return res.status(404).send('No genere found');
  res.send(genere);
});

// Create genere
router.post('/', (req, res) => {
  const { error } = validateGenere(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genere = {
    id: generes.length + 1,
    name: req.body.name
  };

  generes.push(genere);
  res.send(genere);
});

// Edit genere
router.put('/:id', (req, res) => {
  const genere = generes.find(g => g.id === parseInt(req.params.id));
  if (!genere) return res.status(404).send('No genere found');

  const { error } = validateGenere(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  genere.name = req.body.name;
  res.send(genere);
});

// Delete genere
router.delete('/:id', (req, res) => {
  const genere = generes.find(g => g.id === parseInt(req.params.id));
  if (!genere) return res.status(404).send('No genere found');

  const index = generes.indexOf(genere);
  generes.splice(index, 1);

  res.send(genere);
});

// Validate
function validateGenere(genere) {
  const schema = {
    name: Joi.string()
      .min(3)
      .required()
  };
  return Joi.validate(genere, schema);
}

module.exports = router;
