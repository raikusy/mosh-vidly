const express = require('express');
const mongoose = require('mongoose');

const genres = require('./routes/genres');
const customers = require('./routes/customers');

mongoose
  .connect('mongodb://localhost/vidly', { useNewUrlParser: true })
  .then(() => console.log('MongoDB Connected Succesfully'))
  .catch(err => console.log('MongoDB Error: ', err));

const app = express();

app.use(express.json());
app.use('/api/genres', genres);
app.use('/api/customers', customers);

// Hello world
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Listen to port 3000

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
