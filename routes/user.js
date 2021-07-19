const bodyParser = require('body-parser');
const userModel = require('../models/userModel');
const userModelInstance = new userModel();
const express = require('express');
const { isRejected } = require('@reduxjs/toolkit');
const app = express();
const router = express.Router();



router.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
router.use(bodyParser.json());

/**
 * Return all users
 */
router.get('/users', async (req, res) => {
    console.log('/user running');
    try{
        const result = await userModelInstance.findAll();
        console.log('result = ' + result.rows)
        res.json(result.rows);

    }catch(err){
        console.log('error ' + err);
        return res.status(500).send('Internal server error');
    }
});

/**
 * Return single user
 */
router.get('/:id', async (req, res) => {
    console.log('/get-user running');
    const userId = req.params.id;
    if(!req.params.id) return res.status(400).send('Insuffience data');
    try{
        const result = await userModelInstance.findUserById(userId);
        if(!result) return res.status(200).send('No user found');
        res.json(result);
    }catch(err){
        return res.status(500).send('Error retrieving results from database');
    };
});

/**
 * Register new User
 */
router.post('/register', async (req, res, next) => {
    
    const userDetails = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        street: street,
        city: city,
        password: password,
        postCode: postCode,
        } = req.body;
        if(!email || !password || !street || !city || !postCode || !firstName || !lastName) return res.status(400).send('Insufficient data');
        try{
            const user = await userModelInstance.findUserByEmail(email);
        if(user) return res.status(200).send('User already exists');
        await userModelInstance.create(userDetails);
        res.send(`User ${email} added successfully`);
    }catch(err){
        res.status(500).send('Error updating DB. Internal Server Error.');
        console.log(err);
    }   
});


/**
 * Update existing user
 */
router.put('/', async (req, res) => {
    const data = {
        userId: userId,
        columnToUpdate: columnToUpdate,
        newValue: newValue
    } = req.body;
    console.log(userId);
    console.log(columnToUpdate);
    console.log(newValue);
    if(!userId) return res.status(400).send('Insufficient Data.');

    try{
        const user = await userModelInstance.findUserById(userId);
        if(!user) return res.status(400).send('User not found');
        console.log('user found');
        await userModelInstance.update(data);
        res.status(200).send(`User ${userId} successfully updated`);
    }catch(err){
        res.status(500).send('Error accessing DB');
        console.log(err);
    }
});

/**
 * Delete existing user
 */
router.delete('/delete', async (req, res) => {
    const userId = req.body.userId;

    if(!userId) return res.status(400).send('Insufficent data provided.');

    try{
        const user = await userModelInstance.findUserById(userId);
        if(!user) return res.status(404).send('User not found.');
        console.log('user to be deleted exists');
        userModelInstance.delete(userId);
        console.log(user);
        res.send(`${user[0].email} deleted`);
    }catch(err){
        res.status(500).send(err);
    }
});

module.exports = router;