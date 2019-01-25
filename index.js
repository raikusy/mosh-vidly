const Joi = require('joi');
const express = require('express');

const app = express();

app.use(express.json());

// Generes Database
const generes = [{ id: 1, name: 'Action' }, { id: 2, name: 'Horror' }];

// Hello world
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Get all generes
app.get('/api/generes', (req, res) => {
  res.send(generes);
});

// Get one genere
app.get('/api/generes/:id', (req, res) => {
  const genere = generes.find(g => g.id === parseInt(req.params.id));
  if (!genere) return res.status(404).send('No genere found');
  res.send(genere);
});

// Create genere
app.post('/api/generes', (req, res) => {
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
app.put('/api/generes/:id', (req, res) => {
  const genere = generes.find(g => g.id === parseInt(req.params.id));
  if (!genere) return res.status(404).send('No genere found');

  const { error } = validateGenere(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  genere.name = req.body.name;
  res.send(genere);
});

// Delete genere
app.delete('/api/generes/:id', (req, res) => {
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

// Listen to port 3000

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
