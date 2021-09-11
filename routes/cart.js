const express = require('express');
const bodyParser = require('body-parser');
const { route } = require('./user.js');
const Cart = require('../controllers/cartController');
const User = require('../controllers/userController');
const Order = require('../controllers/orderController');
const Product = require('../controllers/productController');
const CartController = require('../controllers/cartController');
const cart = new Cart();
const user = new User();
const order = new Order();
const product = new Product();
const app = express();
const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

/**
 * @swagger
 * /cart:id:
 *   get:
 *     tags:
 *       - Carts
 *     description: Returns user's active cart
 *     parameters:
 *       -name: id
 *       -description: User's id
 *       -in: path
 *       -required: true
 *       -type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: All User's active carts
 *         schema:
 *           $ref: '#/definitions/Cart'
 */
router.get('/:id', cart.findActtiveCart);


/**
 * @swagger
 * /api/carts/remove-item:
 *   delete:
 *     tags:
 *       - Carts
 *     description: Deletes a single item from cart
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: User's id
 *         in: body
 *         required: true
 *         type: integer
 *       - name: productId
 *         description: id of product to be deleted
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: successfully deleted
 */
router.delete('/remove-item', cart.deleteItem);


//PUTE SWAGGER DEF HERE
router.put('/update-quantity', cart.updateQuantity);
/**
 * @swagger
 * /cart/add-item:
 *   post:
 *     tags:
 *       - Users
 *     description: Creates a new user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: id of user
 *         in: body
 *         required: true
 *       - name: productId
 *         description: id of product
 *         in: body
 *         required: true
 *       - name: quantity
 *         description: quantity of product to be added
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Carts'
 *     responses:
 *       200:
 *         description: Successfully added
 */
router.post('/add-item', cart.addItem);
   
/**
 * @swagger
 * /user/register:
 *   post:
 *     tags:
 *       - Users
 *     description: Creates a new user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: user's id
 *         in: body
 *         required: true
 *       - name: payment
 *         description: user's payment details
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Cart'
 *     responses:
 *       200:
 *         description: Successfully ordered.
 */
router.post('/:id/checkout', cart.checkOut);

module.exports = router;