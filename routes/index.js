const express = require('express');
router = express.Router();

const user = require('./user');
const product = require('./products');
const cart = require('./cart');
const order = require('./order');

router.use('/user', user);
router.use('/products', product);
router.use('/carts', cart);
router.use('/orders', order);

module.exports = router;