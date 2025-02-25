// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const productsRouter = require('./src/api/products'); // Path to the newly created products.js file

const app = express();
const port = 5000; // or any port of your choice

app.use(bodyParser.json());
app.use('/api/products', productsRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
