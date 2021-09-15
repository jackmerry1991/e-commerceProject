const db = require('../database/dbConnection.js');
const Cart = require('../models/').Cart;
const Order = require('../models/').Order;
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
    host: process.env.PGHOST,
    dialect: 'postgres',
  
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
})
module.exports = class OrderController{

    /**
     * Get all users for a user.
     * @param {*} data 
     * @returns 
     */
    async getAllUserOrders(req, res){
        console.log('/get-all-orders')
        if(!req.body.userId) return res.status(400).send('Insufficient data');
        const userId = req.body.userId;
        try{
            const orders = await Order.findAll({
                where:{user_id: userId}
            });
            if(!orders) return res.status(200).send('User has no order history');
            res.json(orders);
    }catch(err){
        res.status(500).send('Internal Server Error');
    }
        
    }

    /**
     * Get specific user Order.
     * @param {*} userId 
     * @param {*} orderId 
     * @returns 
     */
    async getOrderDetails(req, res){
        if(!req.body.userId || !req.params.id) return res.status(400).send('Insufficient data');
        const userId = req.body.userId;
        const orderId = req.params.id;
        try{
            const order = await sequelize.query(`SELECT products.name, products.price, cart_products.quantity_ordered, orders.date_ordered FROM products JOIN cart_products ON products.id = cart_products.product_id JOIN orders ON orders.cart_id = cart_products.cart_id WHERE orders.id = ${orderId};`);
            if(!Array.isArray(order)) return res.status(500).send('Internal Server Error');
            if(order.length[0] < 1) return res.send('No orders found');
            return res.json(order[0]);
        }catch(err){
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }
    }

    /**
     * Create a new Order. 
     * @param {} userId 
     * @param {*} item 
     * @param {*} successfulPayment 
     * @returns 
     */
    async create(userId, cartId, successfulPayment, cart){
        console.log('create order');
        console.log(successfulPayment);
        const date = new Date();
        const dateTimeOfOrder = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}, ${date.getHours()}:${date.getMinutes()}`;
        console.log(dateTimeOfOrder);
        let orderTotal = cart.map(order => {
            console.log(order);
            return order.order_total;
        });
        orderTotal = parseFloat(orderTotal);
        console.log(orderTotal);
        try{
            await Order.create({
                user_id: userId,
                cart_id: cartId,
                date_ordered: dateTimeOfOrder,
                total_cost: orderTotal,
                payment_received: successfulPayment
            });
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }
}