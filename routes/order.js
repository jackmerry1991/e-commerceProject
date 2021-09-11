const express = require('express');
const bodyParser = require('body-parser');
const Order = require('../controllers/orderController');
const order = new Order();
const app = express();

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

/**
 * @swagger
 * /order/:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns an array of orders for the user
 *     parameters:
 *      -name: userId
 *      -description: the id of the user
 *      -in: body
 *      -required: true
 *      -type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: All Orders for the user
 *         schema:
 *           $ref: '#/definitions/Orders'
 */
router.get('/', async(req, res) => {
    const userId = req.body.userId;
    if(!userId) return res.status(400).send('Insufficient data');
    try{
        const orders = await order.getAllUserOrders(userId);
        if(!orders) return res.status(200).send('User has no order history');
        res.json(orders);
    }catch(err){
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @swagger
 * /order/:id:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns a specific order
 *     parameters:
 *       - name: userId
 *         description: user's id
 *         in: body
 *         required: true
 *         type: integer
 *       - name: orderId
 *         description: id of the order
 *         in: path
 *         required: true
 *         type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Specific Order
 *         schema:
 *           $ref: '#/definitions/Order'
 */
router.get('/:id', async (req, res) => {
    const userId = req.body.userId;
    const orderId = req.params.id;
    if(!userId || !orderId) return res.status(400).send('Insufficient Data');

    try{
        const order = await order.getOrderDetails(userId, orderId);
        if(!order) return res.status(200).send('No matching orders found');
        console.log(order);
        res.json(order);
    }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;