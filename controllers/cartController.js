const db = require('../database/dbConnection.js');
const CartProducts = require('../models/').CartProducts;
const Cart = require('../models/').Cart;
const Product = require('../models').Product;
const User = require('../models').User;
const OrderController = require('../controllers/orderController');
const orderController = new OrderController();
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

module.exports = class CartController {
    /**
     * Find a user's active cart.
     * @param {*} data 
     * @returns 
     */
    async findActtiveCart(req, res){
        //need to filter by user and whether cart is open.
        console.log('cart/:id running');
        if(!req.params.id) return res.status(400).send('Insufficient data');
        const userId = req.params.id;
        console.log(userId);
        try{
            //raw query as sequelize cannot accurately count products ordered.
            const activeCart = await sequelize.query(`SELECT products.name, cart_products.quantity_ordered FROM products JOIN cart_products on products.id = cart_products.product_id JOIN carts on cart_products.cart_id = carts.id WHERE carts.checked_out = false AND carts.user_id = ${userId};`);
            if(!activeCart) return res.status(200).send('No active cart found');
            return res.json(activeCart[0]);
        }catch(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    }

    /**
     * Delete an item from the cart.
     * @param {*} data 
     * @returns 
     */
    async deleteItem(req, res){
        console.log('/remove-item');
    if(!req.body.userId || !req.body.productId) return res.status(400).send('Insufficient data.')
    const productId = parseInt(req.body.productId);
    const cartId = await Cart.findAll({
        where: {
            user_id: req.body.userId,
            checked_out: false
        },
        include: {
            model: Product,
            as: 'product',
            where: {id: productId}
        }
    });
    if(!cartId) return res.send('User has not stored this item in their cart');
        try{
            await CartProducts.destroy({
                where: {
                    cart_id: cartId[0].dataValues.id,
                    product_id: productId
                }
            });
            //check items still exist for the open cart
            const remainingProductsExist = await CartProducts.findAll({
                where:{cart_id: cartId[0].dataValues.id}
            });
            console.log('rem');
            console.log(remainingProductsExist)
            if(remainingProductsExist.length < 1){
                await Cart.destroy({
                    where: {id: cartId[0].dataValues.id}
                });
            }
            return res.send('Item successfully removed from cart.');
        }catch(err){
            console.log(err);
            return false;
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
async updateQuantity (req, res){
    console.log('/updateQuantity');
    if(!req.body.productId || !req.body.quantity || !req.body.cartId) return res.status(400).send('Insufficient Data');
    try{
        const updatedQuantity = await CartProducts.update({
                                    quantity_ordered: req.body.quantity},
                                    {where:{cart_id: req.body.cartId, product_id: req.body.productId},
                                    returning: true
                                });
                            if(updatedQuantity){
                                return res.status(202).send('Quantity successfully updated');
                            }
                        return res.status(200).send('No product found');
    }catch(err){
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
}
    /**
     * Insert new item into the user's cart
     * @param {*} data 
     * @returns 
     */
    async addItem(req, res){
        console.log('/add-item');
        console.log('body' + req.body.userId);
        if(!req.body.userId || !req.body.productId || !req.body.quantity) return res.status(400).send('Insufficient data');
        const userId = req.body.userId;
        const productId = req.body.productId;
        const quantity = parseInt(req.body.quantity);
        console.log('quantity = ' + quantity)
        try{
            //check if user has any open carts
            let openCart = await Cart.findAll({
                where: {user_id: userId, checked_out: false}
            });
            console.log(openCart[0]);
            if(!Array.isArray(openCart)) return;
            let openCartId = null;
            //creat new cart and add items to cart prod table here
            if(openCart.length < 1){
                console.log('!openCart');
                openCart = await Cart.create({
                            user_id: userId,
                            checked_out: false,
                        },
                        {returning: true}        
                        );
                openCartId = openCart.dataValues.id;
                console.log(openCart)
                CartProducts.create({
                    cart_id: openCartId,
                    product_id: productId,
                    quantity_ordered: quantity
                });
            }else{
                openCartId = openCart[0].dataValues.id;
                //check product does not exist
                const oldQuantity = await CartProducts.findAll({
                    where:{cart_id: openCartId, product_id: productId}
                });
                console.log(oldQuantity);
                if(oldQuantity.length < 1){
                    CartProducts.create({
                        cart_id: openCartId,
                        product_id: productId,
                        quantity_ordered: quantity
                    });
                }else{
                    console.log('old' + oldQuantity);
                    const newQuantity = oldQuantity[0].dataValues.quantity_ordered + quantity;
                    console.log('new' + newQuantity);
                    await CartProducts.update({
                        quantity_ordered: newQuantity},
                        {where: {cart_id: openCartId}
                    });
                }
            }
            res.send('Product successfully added to cart');
        }catch(err){
            console.log(err);
            res.status(500).send('Error accessing database');
        }
    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * Checkout active cart
     */
    async checkOut(req, res){
        console.log('/checkout');
        console.log(req.params.id);
        if(!req.params.id || !req.body.userId || !req.body.paymentDetailsEntered) return res.status(400).send('Insufficient Data'); 
        const cartId = req.params.id;
        const userId = req.body.userId;
        const paymentDetailsEntered = req.body.paymentDetailsEntered;
        try{
            const currentCartTotal = await sequelize.query(`SELECT cart_products.product_id, SUM(quantity_ordered * products.price) as order_total FROM cart_products JOIN products ON cart_products.product_id = products.id JOIN carts ON cart_products.cart_id = carts.id WHERE cart_products.cart_id = ${cartId} AND carts.checked_out = false GROUP BY cart_products.product_id;`);
            console.log('cart')
            if(!Array.isArray(currentCartTotal)) return res.status(500).send('Internal Server Error');
            console.log(currentCartTotal[0]);
            if(currentCartTotal[0].length < 1) return res.send('No matching cart found');
            console.log("cart exists ." + currentCartTotal);

            let successfulPayment = false;
            const paymentDetails = await User.findAll({
                attributes: ["payment_details"],
                where: {id: userId}
            });
            if(paymentDetails.length < 1) return res.status(404).send('No matching user found');
            if(paymentDetails[0].dataValues.payment_details === paymentDetailsEntered){
                successfulPayment = true;
            }

            //TODO FIX SO THAT DATE ORDERED AND PAYMENT RECEIVED STORES CORRECTLY, UPDATE SWAGGER AND DOCS.
            const orderSuccessful = await orderController.create(userId, cartId, paymentDetailsEntered, currentCartTotal[0]);

            if(orderSuccessful){
                const update = await Cart.update({
                    checked_out: true},
                    {where: {id: cartId},
                    returning: true
                });
                res.send('Order successfully created');
            }
            return res.status(500).send('Internal Server Error.');
        }catch(err){
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }
    }
}