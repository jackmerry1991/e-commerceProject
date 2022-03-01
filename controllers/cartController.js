const db = require('../database/dbConnection.js');
const CartProducts = require('../models/').CartProducts;
const Cart = require('../models/').Cart;
const Product = require('../models').Product;
const User = require('../models').User;
const OrderController = require('../controllers/orderController');
const orderController = new OrderController();
const ProductController = require('../controllers/productController');
const Order = require('../models/').Order;
const productController = new ProductController();
const stripe = require("stripe")(process.env.STRIPE_SECRET);


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
});

module.exports = class CartController {
    /**
     * Find a user's active cart.
     * @param {*} data 
     * @returns 
     */
    async findActtiveCart(req, res){
        //need to filter by user and whether cart is open.
        console.log('cart/:id running');
        if(!req.user.id) return res.status(400).send('Insufficient data');
        const userId = req.user.id;
        console.log(userId);
        try{
            //raw query as sequelize cannot accurately count products ordered.
            const activeCart = await sequelize.query(`SELECT cart_products.product_id, carts.id, products.name, cart_products.quantity_ordered, products.price FROM products JOIN cart_products on products.id = cart_products.product_id JOIN carts on cart_products.cart_id = carts.id WHERE carts.checked_out = false AND carts.user_id = ${userId};`);
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
        console.log(req.body);
    if(!req.user.id || !req.body.productId) return res.status(400).send('Insufficient data.')
    const productId = parseInt(req.body.productId);
    const userId = req.user.id;
    const cartId = await Cart.findAll({
        where: {
            user_id: userId,
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
            //TODO RETURN NEW CART LIST
            const newCartList = await sequelize.query(`SELECT cart_products.product_id, carts.id, products.name, cart_products.quantity_ordered, products.price FROM products JOIN cart_products on products.id = cart_products.product_id JOIN carts on cart_products.cart_id = carts.id WHERE carts.checked_out = false AND carts.user_id = ${userId};`);
            if(!newCartList) return res.status(200).send('No active cart found');
            return res.json(newCartList[0]);
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
        console.log('body' + req.body);
        console.log(req.body);
        if(!req.body.productId || !req.body.quantity) return res.status(400).send('Insufficient data');
        const userId = req.user.id;
        console.log('request: ');
        console.log(req);
        console.log('user id = ' + userId);
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
                let oldQuantity = await CartProducts.findAll({
                    where:{cart_id: openCartId, product_id: productId}
                });
                console.log('old quantity ')
                console.log(oldQuantity);
                //oldQuantity = oldQuantity[0].dataValues.quantity_ordered;
                if(oldQuantity.length < 1){
                    CartProducts.create({
                        cart_id: openCartId,
                        product_id: productId,
                        quantity_ordered: quantity
                    });
                }else{
                    oldQuantity = oldQuantity[0].dataValues.quantity_ordered;
                    console.log(oldQuantity);
                    console.log('qauntity');
                    console.log(typeof quantity)
                    let numQuantity = Number(quantity);
                    let numOldQuantity = Number(oldQuantity);
                    const newQuantity = numOldQuantity + numQuantity;
                    console.log(newQuantity);
                    console.log(newQuantity);
                    await CartProducts.update({
                        quantity_ordered: newQuantity},
                        {where: {cart_id: openCartId, product_id: productId}
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
        if(!req.body.cardHolderName || !req.body.paymentMethod) return res.status(400).send('Insufficient Data'); 
        const userId = req.user.id;
        const paymentMethod = req.body.paymentMethod;

        try{
            //get user's active cart
            const [cartDetails, cardDetailsMetaData] = await sequelize.query(`SELECT * from carts where user_id = ${userId} and checked_out = false`);
            console.log('cartDetails:')
            console.log(cartDetails);
            //get cart total
            const [currentCartTotal, metaData] = await sequelize.query(`SELECT cart_products.product_id, SUM(quantity_ordered * products.price) as order_total FROM cart_products JOIN products ON cart_products.product_id = products.id JOIN carts ON cart_products.cart_id = carts.id WHERE carts.user_id = ${userId} AND carts.checked_out = false GROUP BY cart_products.product_id;`);
            console.log('cart')
            console.log(currentCartTotal);
            if(!Array.isArray(currentCartTotal) || !Array.isArray(cartDetails)) return res.status(500).send('Internal Server Error');
            console.log('cart')
            console.log(currentCartTotal);
            if(currentCartTotal.length < 1 || cartDetails.length < 1) return res.send('No matching cart found');
            console.log("cart exists ." + currentCartTotal);
            let amount = 0;
            
            currentCartTotal.forEach((orderRow) => {
                console.log('loop');
                console.log(orderRow);
                amount += orderRow.order_total;
            })
            amount = amount.toFixed(2);
            console.log('to fixed');
            console.log(amount);
            console.log(typeof amount)
            console.log('payment method:')
            console.log(paymentMethod.id);
            let successfulPayment = false;
            try{
                const payment = await stripe.paymentIntents.create({
                    amount: amount*100,
                    currency: "GBP",
                    description: "Company Description is e-commerce test site",
                    payment_method: paymentMethod.id,
                    confirm: true,
                });
            successfulPayment = true;
            console.log('stripe response')
            console.log(payment);
            console.log(cartDetails[0])
            const date = new Date();
            const dateOfOrder = new Date().toISOString().slice(0, 10);
            const dateTimeOfOrder = `${dateOfOrder}, ${date.toLocaleTimeString()}`;
            console.log(dateOfOrder);
            // const timeOfOrder
            // console.log('dateTimeOfOrder ' + dateTimeOfOrder);
            console.log(date);
            // console.log(`userId: ${userId}, cartId: ${cartDetails[0][0].id}, ${dateNow}, ${payment.id}, ${currentCartTotal}`)
            // const orderSuccessful = await order(userId, cartDetails[0][0].id, dateNow, payment.id, amount, successfulPayment);
            const orderSuccessful = await Order.create({
                                        user_id: userId,
                                        cart_id: cartDetails[0].id,
                                        date_ordered: dateTimeOfOrder,
                                        stripe_confirmation: payment.id,
                                        total_cost: amount,
                                        payment_received: successfulPayment
                                    });
            if(orderSuccessful){
                const update = await Cart.update({
                    checked_out: true},
                    {where: {id: cartDetails[0].id},
                    returning: true
                });

                console.log('final');
                console.log(currentCartTotal[0]);
                //TO DO UPDATE QUANTITY OF PRODUCT IN STOCK AFTER CHECKOUT
                return res.send('Order successfully created');
            }
        }catch(error){
            console.log(error);
        }
            return res.status(500).send('Internal Server Error.');
        }catch(err){
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }
    }
}