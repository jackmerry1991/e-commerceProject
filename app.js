require('dotenv').config('./.env');
const user = require('./routes/user.js');
const product = require('./routes/products.js');
const cart = require('./routes/cart.js');
const order = require('./routes/order.js');
const session = require('express-session');
const express = require('express');
const passport = require('passport');
require("./config/passport")(passport);

const app = express();
const port = 3000; 
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
//user routes move to users.js after this initial test
app.use('/user', user);
app.use('/products', product);
app.use('/carts', cart);
app.use('/orders', order);
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

