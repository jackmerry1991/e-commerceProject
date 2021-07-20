const express = require('express');
const bodyParser = require('body-parser');
const { route } = require('./user.js');
const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const cartModelInstance = new cartModel();
const userModelInstance = new userModel();
const orderModelInstance = new orderModel();
const app = express();
const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
/**
 * Get user's active cart by user ID.
 * @returns json object.
 */
router.get('/:id', async (req, res) => {
    console.log('cart/:id running');
    const userId = req.params.id;
    if(!userId) return res.status(400).send('Insufficient data');

    try{
        const cart = await cartModelInstance.findActtiveCart(userId);
        if(!cart) return res.status(200).send('User has no active carts.');
        res.json(cart);
    }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * Delete item from the cart.
 * @returns response.
 */
router.delete('/remove-item', async ( req, res) => {
    console.log('/remove-item');
    const data = {
        userId: userId,
        productId: productId
    } = req.body;
    if(!userId || !productId) return res.status(400).send('Insufficient data.')
    try{
        const itemInCart = await cartModelInstance.findProductQuantity(data);
        if(!itemInCart) return res.send('User has not stored this item in their cart');
        const deleted = await cartModelInstance.deleteItem(data);
        if(!deleted) return res.status(500).send('Error deleting item');
        res.send(`Item has been removed from cart`);
    }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * Add an item to the user's cart.
 * @returns response.
 */
router.post('/add-item', async (req, res, next) => {
    console.log('/add-item');
    console.log('body' + req.body.userId);
    let data = {
        userId: userId,
        productId: productId,
        quantity: quantity
    } = req.body;
    quantity = parseInt(quantity);
    if(!userId || !productId) return res.status(400).send('Insufficient data');

    try{
        //1. Get current products to ensure quantity doesn't need to be incremented instead
        const currentQuantity = await cartModelInstance.findProductQuantity(data);
        if(currentQuantity){
            console.log('Item exists, call function to update quantity instead')
            console.log(currentQuantity[0].quantity);
            const updated = cartModelInstance.updateQuantity(data, currentQuantity[0].quantity);
            if(!updated) return res.status(500).send('Internal Server Error');
            res.send('Quantity updated');
        }else{
            //2. Insert Order into cart.
            const updated = await cartModelInstance.addItem(data);
            if(!updated) return res.status(500).send('Internal Server Error');
            res.send('Product successfully added to cart');
        }
    }catch(err){
        console.log(err);
        res.status(500).send('Error accessing database');
    }
});
/**
 * Checkout all current items in user cart.
 * First ensure user has an active cart.
 * Then calculate order total and item totals.
 * Then check user payment details.
 * Finally create order in orders table and amend checked_out status in carts to true.
 * @returns response.
 */
router.post('/:id/checkout', async (req, res) => {
    console.log(':id/checkout activated');
    const userId = req.params.id;
    const userPayment = req.body.paymentDetails;
    try{
        const currentCart = await cartModelInstance.getCartAndPrices(userId);
        if(!currentCart) return res.send('User has no active carts');
        console.log("cart exists ." + currentCart.rows);
        let totalCost = 0;
        currentCart.map( (row) => {
            console.log(totalCost + '+' + row.price);
            totalCost += (row.price * row.quantity);
            
        });
        
        console.log('total cost = ' + totalCost);
        const cartItems = currentCart.map((row) => {
            console.log(row);
            let cost = row.price * row.quantity;
            console.log('itemisedCost = ' + cost);
            console.log('row name = ' + row.name);
            const itemTotal = {
                productId: row.product_id,
                name: row.name,
                total: cost,
                quantity: row.quantity
            };
            return itemTotal;
        });

        console.log('cartItems = ' + cartItems);
         //confirm payment
         let successfulPayment = false;
         const paymentDetails = await userModelInstance.checkUserPayment(userId);
         console.log('payment details = ' + paymentDetails.payment_details);
         if(userPayment === paymentDetails.payment_details){
             console.log('succesful payment = ' + successfulPayment);
             successfulPayment = true;
         }
         
         cartItems.map( async (item) => {
             console.log(item);
             try{
                 const orderCreated = await orderModelInstance.create(userId, item, successfulPayment);
                 const cartStatusUpdated = await cartModelInstance.setCheckoutStatus(userId);
                 if(!orderCreated || !cartStatusUpdated) return res.status(500).send('Internal Server Error');
                 res.send('Order successfully created.');
                }catch(err){
                 console.log(err);
                 res.status(500).send('error creating order');
             }
        });
    }catch(err){
        console.log(err);
    }
});

module.exports = router;