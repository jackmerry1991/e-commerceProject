const express = require('express');
const bodyParser = require('body-parser');
const OrderModel = require('../models/orderModel');
const orderModelInstance = new OrderModel();
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
        const orders = await orderModelInstance.getAllUserOrders(userId);
        if(!orders) return res.status(200).send('User has no order history');
        res.json(orders);
    }catch(err){
        res.status(500).send('Internal Server Error');
    }
});

/**
 * Get specific order.
 * @returns response.
 */
router.get('/:id', async (req, res) => {
    const userId = req.body.userId;
    const orderId = req.params.id;
    if(!userId || !orderId) return res.status(400).send('Insufficient Data');

    try{
        const order = await orderModelInstance.getOrderDetails(userId, orderId);
        if(!order) return res.status(200).send('No matching orders found');
        console.log(order);
        res.json(order);
    }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;