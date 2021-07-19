const express = require('express');
const db = require('./dbConnection.js')
const bodyParser = require('body-parser');
const app = express();

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

/**
 * Get all orders for a sepecific user
 * @returns response.
 */
router.get('/', async(req, res) => {
    const userId = req.body.userId;
    if(!userId) return res.status(400).send('Insufficient data');
    try{
        const orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
        res.json(orders.rows);
    }catch(err){
        res.status(500).send('Internal Server Error');
    }
});

/**
 * Get specific details of an order.
 * @returns response.
 */
router.get('/:id', async (req, res) => {
    const userId = req.body.userId;
    const orderId = req.params.id;
    if(!userId || !cartId) return res.status(400).send('Insufficient Data');

    try{
        const order = db.query('SELECT * FROM orders WHERE user_id = $1 AND id = $2', [userId, orderId]);
        res.json(order.rows);
    }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});




module.exports = router;