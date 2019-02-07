const express = require('express');
const mongoose = require('mongoose');

const genres = require('./routes/genres');
const customers = require('./routes/customers');
const movies = require('./routes/movies');
const rentals = require('./routes/rentals');

mongoose
  .connect('mongodb://localhost/vidly', { useNewUrlParser: true })
  .then(() => console.log('MongoDB Connected Succesfully'))
  .catch(err => console.log('MongoDB Error: ', err));

const app = express();

app.use(express.json());
app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);

// Hello world
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Listen to port 3000

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
