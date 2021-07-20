const db = require('../database/dbConnection.js')

module.exports = class OrderModel{

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
    async create(userId, item, successfulPayment){
        try{
            const query = 'INSERT INTO orders(user_id, product_id, date_ordered, total_cost, payment_received, quantity) VALUES($1, $2, NOW(), $3, $4, $5)';
            await db.query(query, [userId, item.productId, item.total, successfulPayment, item.quantity]);
            return true;
        }catch(err){
            console.log(err);
        }
    }
}