const jwt = require('jsonwebtoken');
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
        console.log(req.user);
        if(!req.user.id) return res.status(400).send('Insuffient data');
        const userId = req.user.id;
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
        console.log(req.body);
        if(!req.body.email || !req.body.password || !req.body.firstName || !req.body.lastName ) return res.status(400).send('Insufficient data');
        try{
            const salt = await bcrypt.genSalt(10);
            let encryptedPassword = await bcrypt.hash(req.body.password, salt);
            console.log(encryptedPassword);

            //check if email already exists
            const userExists = await User.findOne({
                where: { email: req.body.email}                           
                });
            
            if(userExists) return res.status(409).send("Email already in use");


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
            return res.status(200).send('User Created');
        }catch(err){
            console.log(err);
        }
    }

    async update(req, res){
        console.log(req.body);
        console.log(req.body.email);
        console.log(req.body.street);
        console.log(req.body.city);
        console.log(req.body.postcode);
        console.log(req.body.firstName);
        console.log(req.body.lastName);


        if(!req.body.email || !req.body.street || !req.body.city || !req.body.postcode || !req.body.firstName || !req.body.lastName) return res.status(400).send('Insufficient data');
        console.log('here');
        try{
            const userId = req.user.id;
            const result = await User.update({
                        email: req.body.email,
                        first_name: req.body.firstName,
                        last_name: req.body.lastName,
                        street: req.body.street,
                        city: req.body.city,
                        post_code: req.body.postCode,
                    },
                    {
                        where: {id: userId},
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

    async authenticateToken(req, res, next) {
        console.log('auth token');
        console.log(req.headers);
        const authHeader = req.headers['authorization']
        console.log(authHeader);
        const token = authHeader && authHeader.split(' ')[1]
        console.log(token)
        if (token === null) return res.sendStatus(401)
      
        jwt.verify(token, process.env.SECRET, (err, user) => {
          console.log(err);
      
          if (err) return res.sendStatus(401);
      
          req.user = user.user;
          console.log(req.user);
          next();
        })
      }

      async logout (req, res) {
        // Set token to none and expire after 5 seconds
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 5 * 1000),
            httpOnly: true,
        })
        res
            .status(200)
            .json({ success: true, message: 'User logged out successfully' })
    }
}