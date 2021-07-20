require('dotenv').config('./.env');
const user = require('./routes/user.js');
const product = require('./routes/products.js');
const cart = require('./routes/cart.js');
const order = require('./routes/order.js');
const express = require('express');
const app = express();
const port = 3000; 

//user routes move to users.js after this initial test
app.use('/user', user);
app.use('/products', product);
app.use('/carts', cart);
app.use('/orders', order);
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

