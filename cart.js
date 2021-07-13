const express = require('express');
const db = require('./dbConnection.js')
const bodyParser = require('body-parser');
const { route } = require('./user.js');
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
        const cart = await db.query('SELECT * FROM carts WHERE user_id = $1 AND checked_out = false', [userId]);
        if(cart.rows.length < 1) return res.status(200).send('User has no active carts.');
        res.json(cart.rows);
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
        await db.query('DELETE FROM carts WHERE user_id = $1 AND product_id = $2', [userId, productId]);
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
        const currentQuantity = await db.query('SELECT * FROM carts WHERE user_id = $1 AND checked_out = false AND product_id = $2', [userId, productId]);
        console.log('rows = ' + currentQuantity.rows.length);
        if(currentQuantity.rows.length > 0){
            console.log('Item exists, call function to update quantity instead')
            console.log(currentQuantity.rows[0].quantity);
            updateQuantity(userId, productId, quantity, currentQuantity.rows[0].quantity);
            res.send('Quantity updated');
        }else{
            //2. Insert Order into cart.
            await db.query('INSERT INTO carts(user_id, date_time, product_id, quantity, checked_out) values($1, NOW(), $2, $3, false)', [userId, productId, quantity]);
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
        const currentCart = await db.query('SELECT carts.*, products.price, products.product_id, products.name FROM carts join products on carts.product_id = products.product_id WHERE user_id = $1 AND checked_out = false', [userId]);
        if(currentCart.rows.length < 1) return res.send('User has no active carts');
        console.log("cart exists ." + currentCart.rows);
        let totalCost = 0;
       currentCart.rows.map( (row) => {
            console.log(totalCost + '+' + row.price);
            totalCost += (row.price * row.quantity);
            
        });
        
        console.log('total cost = ' + totalCost);
        const cartItems = currentCart.rows.map((row) => {
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
         const paymentDetails = await db.query('SELECT payment_details FROM users where user_id = $1', [userId]);
         console.log('payment details = ' + paymentDetails.rows[0].payment_details);
         if(userPayment === paymentDetails.rows[0].payment_details){
             console.log('succesful payment = ' + successfulPayment);
             successfulPayment = true;
         }
         
         cartItems.map( async (item) => {
             console.log(item);
             try{
                 console.log(`INSERT INTO orders(${userId}, ${item.productId}, NOW(), ${item.total}, ${successfulPayment}, ${item.quantity})`);
                 db.query('INSERT INTO orders(user_id, product_id, date_ordered, total_cost, payment_received, quantity) VALUES($1, $2, NOW(), $3, $4, $5)', [userId, item.productId, item.total, successfulPayment, item.quantity]);
                 db.query('UPDATE carts SET checked_out = true WHERE user_id = $1', [userId]);
                 res.send('Order successfully created.');
                }catch(err){
                 console.log(err);
                 res.status(500).send('error creating order');
             }
        });
    }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});
/**
 * 
 * @param {*} userId 
 * @param {*} productId 
 * @param {*} quantity 
 * @param {*} currentQuantity 
 * @returns udated cart quantity if user and product already exists and not checked out of db.
 */
const updateQuantity = (userId, productId, quantity, currentQuantity) => {
    console.log(userId);
    console.log(productId);
    console.log(typeof quantity);
    console.log(typeof currentQuantity);
    if(!userId || !productId) return res.status(500).send('User or product data not provided');
    const newQuantity = quantity + currentQuantity;
    try{
        db.query('UPDATE carts SET quantity = $1 WHERE user_id = $2 AND product_id = $3 AND checked_out = false', [newQuantity, userId, productId]);
    }catch(err){
        console.log(err);
        res.status(500).send('Error updating database');
    }
}
module.exports = router;