const express = require('express');
const Product = require('../controllers/productController');
const app = express();
const router = express.Router();
const product = new Product();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images')
    },
    filename: (req, file, cb) => {
        cb(null, String(Date.now()), + ' - ' + file.originalname)
    }
});
const uploads = multer({storage});

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
router.get('/', product.list);

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
 router.get('/search', product.searchProduct);
 
 

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
router.get('/category-search', product.searchByCategory);
    


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
router.get('/id-search/:id', product.getById);

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
router.post('/create', product.create);
    // '/create', async (req, res) => {
    // console.log('/create running');
    // const product = {
    //     prodName: prodName,
    //     description: description,
    //     price: price,
    //     quantity: quantity,
    //     category: category
    // } = req.body;
    // console.log(description);
    // console.log(price);
    // if(!prodName || !description || !price || !quantity ) return res.status(400).send('Insufficient data provided');
//     try{
//         console.log(req.body);
//         await product.create(req);
//         //res.send(`New product: ${prodName} has been added.`);
//     }catch(err){
//         console.log(err);
//         res.status(500).send(`Error accessing db`);
//     }
// });

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
router.delete('/delete',  product.delete);

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
router.put('/', product.update);


//TODO DOCUMENT API ROUTE, ADD IMAGE PATH TO PRODUCTIMAGE TABLE.
router.post('/store-product-image', uploads.single('image'), product.uploadImage)

//TODO COMPLETE ROUTE AND DOCUMENT IS THIS NECESSARY OR SHOULD THE IMAGE PATHS BE PASSED BACK WITH THE DATA - WAIT UNTIL FRONT END TO IMPLEMENT???
router.get('/retrieve-image')


module.exports = router;