const express = require('express');
const bodyParser = require('body-parser');
const { route } = require('./user.js');
const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const ProductModel = require('../models/productModel');
const cartModelInstance = new cartModel();
const userModelInstance = new userModel();
const orderModelInstance = new orderModel();
const productModelInstance = new ProductModel();
const app = express();
const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

/**
 * @swagger
 * /cart:id:
 *   get:
 *     tags:
 *       - Carts
 *     description: Returns user's active cart
 *     parameters:
 *       -name: id
 *       -description: User's id
 *       -in: path
 *       -required: true
 *       -type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: All User's active carts
 *         schema:
 *           $ref: '#/definitions/Cart'
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
 * @swagger
 * /api/carts/remove-item:
 *   delete:
 *     tags:
 *       - Carts
 *     description: Deletes a single item from cart
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: User's id
 *         in: body
 *         required: true
 *         type: integer
 *       - name: productId
 *         description: id of product to be deleted
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: successfully deleted
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
 * @swagger
 * /cart/add-item:
 *   post:
 *     tags:
 *       - Users
 *     description: Creates a new user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: id of user
 *         in: body
 *         required: true
 *       - name: productId
 *         description: id of product
 *         in: body
 *         required: true
 *       - name: quantity
 *         description: quantity of product to be added
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Carts'
 *     responses:
 *       200:
 *         description: Successfully added
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
            productModelInstance.updateQuantity(data);
            res.send('Product successfully added to cart');
        }
    }catch(err){
        console.log(err);
        res.status(500).send('Error accessing database');
    }
});
/**
 * @swagger
 * /user/register:
 *   post:
 *     tags:
 *       - Users
 *     description: Creates a new user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: user's id
 *         in: body
 *         required: true
 *       - name: payment
 *         description: user's payment details
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Cart'
 *     responses:
 *       200:
 *         description: Successfully ordered.
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