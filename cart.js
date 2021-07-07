const express = require('express');
const db = require('./dbConnection.js')
const bodyParser = require('body-parser');
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

router.delete('/remove-item', async ( req, res) => {
    console.log('/remove-item');
    const data = {
        userId: userId,
        productId: productId
    } = req.body;
    if(!userId || !productId)
    try{
        await db.query('DELETE FROM carts WHERE user_id = $1 AND product_id = $2', [userId, productId]);
        res.send(`Item has been removed from cart`);
    }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

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
            await db.query('INSERT INTO carts(user_id, date_time, product_id, quantity, checked_out) values($1, NOW(), $2, $3, false)', [userId, productId, quantity]);
            res.send('Product successfully added to cart');
        }

    }catch(err){
        console.log(err);
        res.status(500).send('Error accessing database');
    }
});

//function to increment quantity as product already listed in table
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