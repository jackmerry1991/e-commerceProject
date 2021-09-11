const { response } = require('express');
const express = require('express');
const db = require('../database/dbConnection.js')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('../models/').User;
module.exports = class UserController {

    /**
     * Return all users
     * @returns json object
     */
    async list(req, res){
        console.log('user.list hit');
        try{
        const users = await User.findAll();
        console.log(users);
        if(!users) return res.status(401).send('No Users Found');
        res.json(users);
        }catch(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
        }
    }

    async findUserById(req, res){
        console.log('/get-user running');
        const userId = req.params.id;
        if(!req.params.id) return res.status(400).send('Insuffience data');
        try{
            const user = await User.findAll({
                where: {
                    id: userId
                }
            });
            if(!user.length > 0) return res.status(401).send('No User Found');
            res.json(user);
        }catch(err){
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }
    }
    /**
     * Find user by email
     * @param {*} data 
     * @returns 
     */
    async findUserByEmail(req, res){
        console.log(data);
        try{
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await db.query(query, [data]);
            if(!(await result).rows.length > 0) return null;
            console.log(result.rows);
            return result.rows[0];
        }catch(err){
            console.log(err);
        }
    }

    /**
     * Create new user and add to users table.
     * @param {*} data 
     * @returns 
     */
    async create(req, res){
        console.log('user/create');
       
        if(!req.body.email || !req.body.password || !req.body.street || !req.body.city || !req.body.postCode || !req.body.firstName || !req.body.lastName) return res.status(400).send('Insufficient data');
        try{
            const salt = await bcrypt.genSalt(10);
            let encryptedPassword = await bcrypt.hash(req.body.password, salt);
            console.log(encryptedPassword);
            await User.create({
                email: req.body.email,
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                password: encryptedPassword,
                street: req.body.street,
                city: req.body.city,
                post_code: req.body.postCode,
                payment_details: req.body.paymentDetails
            });
            return res.status(201).send('User Created');
        }catch(err){
            console.log(err);
        }
    }

    async update(req, res){

        if(!req.body.email || !req.body.street || !req.body.city || !req.body.postCode || !req.body.firstName || !req.body.lastName || !req.body.paymentDetails) return res.status(400).send('Insufficient data');
        try{
            const result = await User.update({
                        email: req.body.email,
                        first_name: req.body.firstName,
                        last_name: req.body.lastName,
                        street: req.body.street,
                        city: req.body.city,
                        post_code: req.body.postCode,
                        payment_details: req.body.paymentDetails
                    },
                    {
                        where: {id: req.body.userId},
                        returning: true
                    }
                );
            return res.json(result);        
        }catch(err){
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }
    }

    async delete(req, res){
        const userId = req.body.userId;
        if(!userId) return res.status(400).send('Insufficent data provided.');
        try{
            await User.destroy({
                where: {id: userId}
            });
            return res.status(204).send(`User ${userId} deleted successfully.`)
        }catch(err){
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }
    }

    /**
     * 
     * @param {*} data 
     * @returns string
     * Get payment information from user based on user id.
     */
    async checkUserPayment(data){
        try{
            const result = await User.findAll({
                attributes: [payment_details],
                where: {id: data}
            });
           if(result.length < 1) return null;
           console.log('Payment details = ' + result);
            return result;
        }catch(err){
            console.log(err);
        }
    }
}