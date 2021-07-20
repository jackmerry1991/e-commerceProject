const db = require('../database/dbConnection.js')

module.exports = class CartModel {
    /**
     * Find a user's active cart.
     * @param {*} data 
     * @returns 
     */
    async findActtiveCart(data){
        try{
            const query = 'SELECT * FROM carts WHERE user_id = $1 AND checked_out = false';
            const result = await db.query(query, [data]);
            if(result.rows.length < 1) return null;
            return result.rows;
        }catch(err){
            console.log(err);
        }
    }

    /**
     * Delete an item from the cart.
     * @param {*} data 
     * @returns 
     */
    async deleteItem(data){
        try{
            const query = 'DELETE FROM carts WHERE user_id = $1 AND product_id = $2'
            await db.query(query, [data.userId, data.productId]);
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async findProductQuantity(data){
        try{
            const query = 'SELECT * FROM carts WHERE user_id = $1 AND checked_out = false AND product_id = $2';
            const result = await db.query(query, [data.userId, data.productId]);
            if(result.rows.length < 1) return null;
            return result.rows;
        }catch(err){
            console.log(err);
        }
    }

/**
 * 
 * @param {*} userId 
 * @param {*} productId 
 * @param {*} quantity 
 * @param {*} currentQuantity 
 * @returns udated cart quantity if user and product already exists and not checked out of db.
 */
async updateQuantity (data, currentQuantity){
    if(!userId || !productId) return res.status(500).send('User or product data not provided');
    const newQuantity = quantity + currentQuantity;
    try{
        await db.query('UPDATE carts SET quantity = $1 WHERE user_id = $2 AND product_id = $3 AND checked_out = false', [newQuantity, data.userId, data.productId]);
        return true;
    }catch(err){
        console.log(err);
    }
}
    /**
     * Insert new item into the user's cart
     * @param {*} data 
     * @returns 
     */
    async addItem(data){
        try{
            const query = 'INSERT INTO carts(user_id, date_time, product_id, quantity, checked_out) values($1, NOW(), $2, $3, false)';
            await db.query(query, [data.userId, data.productId, data.quantity]);
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async getCartAndPrices(data){
        try{
            const query = 'SELECT carts.*, products.price, products.product_id, products.name FROM carts join products on carts.product_id = products.product_id WHERE user_id = $1 AND checked_out = false';
            const result = await db.query(query, [userId]);
            if(result.rows.length < 1) return null;
            return result.rows;

        }catch(err){
            console.log(err);
        }
    }

    async setCheckoutStatus(data){
        try{
            const query = 'UPDATE carts SET checked_out = true WHERE user_id = $1';
            await db.query(query, [userId]);
            return true;
        }catch(err){
            console.log(err);
        }
    }
}