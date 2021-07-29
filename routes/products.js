const express = require('express');
const ProductModel = require('../models/productModel');
const app = express();
const router = express.Router();
const productModelInstance = new ProductModel();
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));

/**
 * @swagger
 * /products/:
 *   get:
 *     tags:
 *       - Products
 *     description: Returns an array of products
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: All Users
 *         schema:
 *           $ref: '#/definitions/User'
 */
router.get('/', async (req, res) => {
    try{
        const result = await productModelInstance.getAllProducts();
        res.json(result);
    }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @swagger
 * /Products/search:
 *   get:
 *     tags:
 *       - Products
 *     description: Returns an array of products matching the search terms
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: searchTerm
 *         description: The word or phrase being searched for
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: An array of products
 *         schema:
 *           $ref: '#/definitions/Products'
 */
 router.get('/search', async(req, res) => {
    console.log('calling /search');
    const searchTerm = `%${req.body.searchTerm}%`;
    console.log('search = ' + searchTerm);

    if(!searchTerm) return res.status(400).send('Insufficient data');
    console.log(typeof searchTerm);
    if(typeof searchTerm !== 'string') return res.status(400).send('Incorrect data format');
    try{
        const searchResult = await productModelInstance.searchProduct(searchTerm);
        if(!searchResult) return res.status(200).send('No products match your search');
        res.json(searchResult);
    } catch(err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
});

/**
 * @swagger
 * /Products/search:
 *   get:
 *     tags:
 *       - Products
 *     description: Returns an array of products within the search category
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: category
 *         description: The category of the search
 *         in: body
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: An array of products
 *         schema:
 *           $ref: '#/definitions/Products'
 */
router.get('/category-search', async (req, res) => {
    const category = req.query.category;
    console.log(category);
    if(!category) return res.status(400).send('Insufficient data');
    try{
        const result = await productModelInstance.searchByCategory(category);
        if(!result) return res.status(200).send('No results found');
        res.json(result);
    }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @swagger
 * /Products/id-search/:id:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns a single product
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: product id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A single product
 *         schema:
 *           $ref: '#/definitions/Products'
 */
router.get('/id-search/:id', async (req, res) => {
    console.log('/:id running');
    const productId = parseInt(req.params.id);
    console.log(typeof productId);
    if(!productId) return res.status(400).send('Insufficient data');
    if(typeof(productId) !== 'number') return res.status(400).send('Incorrect data format');

    try{
        const result = await productModelInstance.getById(productId);
        if(!result) return res.status(200).send('No product found');
        res.json(result);
    }catch(err){
        console.log(err);
        return res.status(500).send('Error accessing database');
    }
});


/**
 * @swagger
 * /products/create:
 *   post:
 *     tags:
 *       - products
 *     description: Creates a new product
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: prodName
 *         description: name of the product
 *         in: body
 *         required: true
 *       - name: description
 *         description: description of the product
 *         in: body
 *         required: true
 *       - name: price
 *         description: the price of the product
 *         in: body
 *         required: true
 *       - name: quantity
 *         description: number of the product in stock
 *         in: body
 *         required: true
 *       - name: category
 *         description: the category of the product
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Products'
 *     responses:
 *       200:
 *         description: Successfully created
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
        await productModelInstance.create(product);
        res.send(`New product: ${prodName} has been added.`);
    }catch(err){
        console.log(err);
        res.status(500).send(`Error accessing db`);
    }
});

/**
 * @swagger
 * /api/products/delete:
 *   delete:
 *     tags:
 *       - Product
 *     description: Deletes a single product
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: productId
 *         description: Product's id
 *         in: body
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: successfully deleted
 */
router.delete('/delete', async (req, res) => {
    console.log('/delete activated');
    const productId = req.body.productId;
    console.log(productId);
    if(!productId) return res.status(400).send('Insufficient data');

    try{
        const product = await productModelInstance.getById(productId);
        if(!product) return res.status(200).send('No matching product found');
        await productModelInstance.delete(productId);
        res.send('Product deleted');
    }catch(err){
        console.log(err);
        res.status(500).send('Error accessing the database');
    }
});

/**
* @swagger
* /products/:
*   put:
*     tags: Products
*     description: Updates a single product
*     produces: application/json
*     parameters:
*      - name: productId
*        in: body
*        description: Id of the product to be updated
*      - name: columnToUpdate
*        in: body
*        description: column of the user table to be updated
*      - name: valueToInsert
*        in: body
*        description: New value to be inserted into the column
*        schema:
*         type: array
*         $ref: '#/definitions/Products'
*     responses:
*       200:
*         description: Successfully updated
*/
router.put('/', async(req, res) => {
    console.log('/put activated');
    
    const data = {
        productId: productId,
        columnToUpdate: columnToUpdate,
        valueToInsert: valueToInsert
    } = req.body;

    if(!productId || !columnToUpdate || !valueToInsert) return res.status(400).send('Insufficient data provided');

    try{
        const product = await productModelInstance.getById(productId);
        if(!product) return res.status(200).send('No matching products found');
        await productModelInstance.update(data);
        res.send(`Product ${productId} updated.`);
    }catch(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;