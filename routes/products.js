const express = require('express');
const db = require('../database/dbConnection')
const bodyParser = require('body-parser');
const app = express();
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));

/**
 * Get all products
 * @returns json object
 */
router.get('/', async (req, res) => {
    try{
        const result = await db.query('SELECT * FROM products');
        res.json(result.rows);
    }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * Search for specific product or products using a search term
 * @returns json object.
 */
 router.get('/search', async(req, res) => {
    console.log('calling /search');
    const searchTerm = `%${req.body.searchTerm}%`;
    console.log('search = ' + searchTerm);

    if(!searchTerm) return res.status(400).send('Insufficient data');
    console.log(typeof searchTerm);
    if(typeof searchTerm !== 'string') return res.status(400).send('Incorrect data format');

    try{
        const searchResult = await db.query("SELECT DISTINCT * FROM products WHERE name LIKE $1 OR description LIKE $1", [searchTerm]);
        if(searchResult.length < 1) return res.status(200).send('No products match your search');
        res.json(searchResult.rows);
    } catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

/**
 * Search product by category
 */
router.get('/category-search', async (req, res) => {
    const category = req.query.category;
    console.log(category);
    if(!category) return res.status(400).send('Insufficient data');
    try{
        const result = await db.query('SELECT * FROM products WHERE category = $1', [category]);

        if(result.rows.length < 1) return res.status(200).send('No results found');
        res.json(result.rows);
    }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * Get product based on id.
 * @returns json object
 */
router.get('/id-search/:id', async (req, res) => {
    console.log('/:id running');
    const productId = parseInt(req.params.id);
    console.log(typeof productId);
    if(!productId) return res.status(400).send('Insufficient data');
    if(typeof(productId) !== 'number') return res.status(400).send('Incorrect data format');

    try{
        const result = await db.query('SELECT * FROM products WHERE product_id = $1', [productId]);
        res.json(result.rows);
    }catch(err){
        console.log(err);
        return res.status(500).send('Error accessing database');
    }
});


/**
 * Create new product
 * @returns response.
 */
router.post('/create', async (req, res) => {
    console.log('/create running');
    const product = {
        prodName: prodName,
        description: description,
        price: price,
        quantity: quantity,
        category: category
    } = req.body;
    console.log(description);
    console.log(price);
    if(!prodName || !description || !price || !quantity ) return res.status(400).send('Insufficient data provided');
    try{
        await db.query('INSERT INTO products(name, description, price, quantity, category) VALUES ($1, $2, $3, $4, $5)', [prodName, description, price, quantity, category]);
        res.send(`New product: ${prodName} has been added.`)
    }catch(err){
        console.log(err);
        res.status(500).send(`Error accessing db`);
    }
});

/**
 * Delete product from the products table
 * @returns Response.
 */
router.delete('/delete', async (req, res) => {
    console.log('/delete activated');
    const productId = req.body.productId;
    console.log(productId);
    if(!productId) return res.status(400).send('Insufficient data');

    try{
        const product = await db.query('SELECT * FROM products WHERE product_id = $1', [productId]);
        if(product.rows.length < 1) return res.status(200).send('No matching product found');
        await db.query('DELETE FROM products WHERE product_id = $1', [productId]);
        res.send('Product deleted');
    }catch(err){
        console.log(err);
        res.status(500).send('Error accessing the database');
    }
});

router.put('/', async(req, res) => {
    console.log('/put activated');
    
    const productId = req.body.productId;
    const columnToUpdate = req.body.columnToUpdate;
    const valueToInsert = req.body.valueToInsert;

    if(!productId || !columnToUpdate || !valueToInsert) return res.status(400).send('Insufficient data provided');

    try{
        const product = await db.query('SELECT * FROM products WHERE product_id = $1', [productId]);
        if(product.rows.length < 1) return res.status(200).send('No matching products found');
        await db.query(`UPDATE products set ${columnToUpdate} = $1 WHERE product_id = $2`, [valueToInsert, productId]);
        res.send(`Product ${productId} updated.`);
    }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;