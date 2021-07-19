const db = require('../database/dbConnection')

module.exports = class ProductModel {
    async getAllProducts(){
        try{
            const query = 'SELECT * FROM products';
            const result = await db.query(query);
            if(result.rows.length < 1) return null;
            return result.rows;
        }catch(err){
            console.log(err);
        }
    }

    async getById(data){
        try{
            const query = 'SELECT * FROM products WHERE product_id = $1';
            const result = await db.query(query, [data]);
            if(result.rows.length < 1) return null;
            return result.rows;
        }catch(err){
            console.log(err);
        }
    }

    async searchProduct(data){

        try{
            const searchResult = await db.query("SELECT DISTINCT * FROM products WHERE name LIKE $1 OR description LIKE $1", [data]);
            if(searchResult.rows.length < 1) return null;
            return searchResult.rows;
        }catch(err){
            console.log(err);
        }
    }

    async searchByCategory(data){
        try{
            const query = "SELECT * FROM products WHERE category = $1";
            const result = await db.query(query, [data]);
            if(result.rows.length < 1) return null;
            return result.rows;
        }catch(err){
            console.log(err);
        }
    }

    async create(data){
        try{
            const query = 'INSERT INTO products(name, description, price, quantity, category) VALUES ($1, $2, $3, $4, $5)';
            await db.query(query, [data.prodName, data.description, data.price, data.quantity, data.category]);
        }catch(err){
            console.log(err);
        }
    }

    async update(data){
        try{
            const query = `UPDATE products SET ${columnToUpdate} = $1 WHERE product_id = $2`;
            await db.query(query, [data.valueToInsert, data.productId]);
        }catch(err){
            console.log(err);
        }
    }

    async delete(data){
        try{
            const query = 'DELETE FROM products WHERE product_id = $1';
            await db.query(query, [data]);
        }catch(err){
            console.log(err);
        }
    }
} 