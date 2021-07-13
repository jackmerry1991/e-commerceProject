require('dotenv').config('./.env');
const user = require('./user.js');
const product = require('./products.js');
const cart = require('./cart.js');
const express = require('express');
const app = express();
const port = 3000; 

//user routes move to users.js after this initial test
app.use('/user', user);
app.use('/products', product);
app.use('/carts', cart);
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

