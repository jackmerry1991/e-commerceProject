const db = require('../database/dbConnection.js');
const Cart = require('../models/').Cart;
const Order = require('../models/').Order;

module.exports = class OrderController{

    /**
     * Get all users for a user.
     * @param {*} data 
     * @returns 
     */
    async getAllUserOrders(data){
        try{
            const query = 'SELECT * FROM orders WHERE user_id = $1';
            const result = await db.query(query, [data]);
            if(result.rows.length < 1) return null;
            return result.rows;
        }catch(err){
            console.log(err);
        }
    }

    /**
     * Get specific user Order.
     * @param {*} userId 
     * @param {*} orderId 
     * @returns 
     */
    async getOrderDetails(userId, orderId){
        try{
            const query = 'SELECT * FROM orders WHERE user_id = $1 AND id = $2';
            const result = await db.query(query, [userId, orderId]);
            if(result.rows.length < 1) return null;
            return result.rows;
        }catch(err){
            console.log(err);
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
        const date = new Date();
        let dateTimeOfOrder = date.getFullYear + date.getMonth + date.getDate + date.getHours + date.getMinutes;
        dateTimeOfOrder = dateTimeOfOrder.toString();
        console.log(date);
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
                successful_payment: successfulPayment
            });
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }
}