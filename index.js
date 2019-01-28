const express = require('express');
const generes = require('./routes/generes');

const app = express();

app.use(express.json());
app.use('/api/generes', generes);

// Hello world
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Listen to port 3000

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
