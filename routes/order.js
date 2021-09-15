const express = require('express');
const bodyParser = require('body-parser');
const Order = require('../controllers/orderController');
const order = new Order();
const app = express();

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

/**
 * @swagger
 * /order/:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns an array of orders for the user
 *     parameters:
 *      -name: userId
 *      -description: the id of the user
 *      -in: body
 *      -required: true
 *      -type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: All Orders for the user
 *         schema:
 *           $ref: '#/definitions/Orders'
 */
router.get('/', order.getAllUserOrders);

/**
 * @swagger
 * /order/:id:
 *   get:
 *     tags:
 *       - Orders
 *     description: Returns a specific order
 *     parameters:
 *       - name: userId
 *         description: user's id
 *         in: body
 *         required: true
 *         type: integer
 *       - name: orderId
 *         description: id of the order
 *         in: path
 *         required: true
 *         type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Specific Order
 *         schema:
 *           $ref: '#/definitions/Order'
 */
router.get('/:id', order.getOrderDetails);

module.exports = router;