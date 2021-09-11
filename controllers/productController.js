const Product = require('../models/').Product;
const {Op} = require('sequelize');


module.exports = class ProductController {
    async list(req, res){
        try{
            const products = await Product.findAll();
            console.log(products);
            if(products.length < 1) return res.status(404).send('No products found');
            return res.json(products);
        }catch(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    }

    async getById(req, res){
        console.log('/:id running');
        const productId = parseInt(req.params.id);
        if(!productId) return res.status(400).send('Insufficient data');
        console.log(typeof productId);
        if(typeof(productId) !== 'number') return res.status(400).send('Incorrect data format');
        try{
            const result = await Product.findAll({
                where: {
                    id: productId
                }
            });
            if(result.length < 1) return res.status(404).send('No products found');
            return res.json(result);
        }catch(err){
            console.log(err);
        }
    }

    async searchProduct(req, res){
        console.log('calling /search');
        const searchTerm = `%${req.body.searchTerm}%`;
        console.log('search = ' + searchTerm);
        
        if(!searchTerm) return res.status(400).send('Insufficient data');
        if(typeof searchTerm !== 'string') return res.status(400).send('Incorrect data format');
            
        try{
            const searchResult = await Product.findAll({
                where:{
                    [Op.or]: {
                    name: {
                        [Op.like]: searchTerm
                    },
                   
                    description: {
                        [Op.like]: searchTerm
                        
                    }
                }
            }
            });
            if(!searchResult) return res.status(400).send('No products match your search');
            res.json(searchResult);
        } catch(err) {
            console.log(err);
            res.status(500).send('Internal server error');
        }
    }

    async updateQuantity(data){
        try{
            
            const currentQuantity = await Product.findAll({
                attributes:['quantity'],
                where:{
                    id: data.productId
                }
            });

            const newQuantity = currentQuantity - data.quantity;
            Product.update({
                quantity: newQuantity,
            },
            {
                where: {
                    id: data.productId,
                    returning: true
                }
            });
            return newQuantity;
        }catch(err){
            console.log(err);
        }
    }

    async searchByCategory(req, res){
        console.log('/searchCategory');
        const category = req.body.category;
        if(!category) return res.status(400).send('Insufficient data');
        try{
            const result = await Product.findAll({
                where:{
                    category: category
             }
            });
            if(result.length < 1) return res.status(404).send('No Products found');
            return res.json(result);
        }catch(err){
            console.log(err);
        }
    }

    async create(req, res){
        
        console.log('/create async active');
        console.log(req.body.prodName);
            
        if(!req.body.prodName || !req.body.description || !req.body.price || !req.body.quantity ) return res.status(400).send('Insufficient data provided');
        try{
            await Product.create({
                name: req.body.prodName,
                description: req.body.description,
                price: req.body.price,
                quantity: req.body.quantity,
                category: req.body.category
            });
            return res.status(200).send(`New product, ${req.body.prodName} created`);
        }catch(err){
            console.log(err);
        }
    }

    async update(req, res){
        console.log('/update');
        if(!req.body.id || !req.body.prodName || !req.body.description || !req.body.price || !req.body.quantity || ! req.body.category) return res.status(400).send('Insufficient data provided');
        try{
            const result = await Product.update({
                name: req.body.prodName,
                description: req.body.description,
                price: req.body.price,
                quantity: req.body.quantity,
                category: req.body.category
            },
            {
                where: {id: req.body.id},
                returning: true
            }
            );
            return res.json(result);
        }catch(err){
            console.log(err);
            res.status(500).send('Internal server error');
        }
    }

    async delete(req, res){
        console.log('/delete controller hit');
        console.log(req.body.productId);
        if(!req.body.productId) return res.status(400).send('Insufficient data');
        try{
            await Product.destroy({
                where: {
                    id: req.body.productId
                }
            });
            res.status(204).send(`Product ${req.body.productId} deleted successfully`);
        }catch(err){
            console.log(err);
            res.status(500).send('Internal Server error')
        }
    }
} 