const express = require('express');
const db = require('./dbConnection.js')
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
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
        const result = await db.query('SELECT * FROM users');
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
        const result = await db.query(`SELECT * FROM users WHERE user_id = $1`, [userId]);
        if(result.rows.length < 1) return res.status(200).send('No mathcing users found');
        res.json(result.rows);
    }catch(err){
        return res.status(500).send('Error retrieving results from database');
    };
});

/**
 * Create new User
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
        const salt = await bcrypt.genSalt(10);
        let encryptedPassword = await bcrypt.hash(password, salt);
        console.log(encryptedPassword);
        try{
        const user = await db.query('SELECT * from users WHERE email = $1', [email]);
        if(user.rows > 0) return res.status(200).send('User already exists');
        const result = await db.query('INSERT INTO USERS(email, first_name, last_name, street, city, password, post_code) VALUES($1, $2, $3, $4, $5, $6, $7);', [email, firstName, lastName, street, city, encryptedPassword, postCode]);
        res.send(`User ${email} added successfully`);
    
    }catch(err){
        res.status(500).send('Error updating DB. Internal Server Error.');
        console.log(err);
    }   
});

// app.post('/login',
//   passport.authenticate('local'),
//   (req, res) => {
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     res.redirect('/users/' + req.user.username);
//   });

/**
 * Update existing user
 */
router.put('/', async (req, res) => {
    const userId = req.body.userId;
    const columnName = req.body.columnToUpdate;
    const newValue = req.body.newValue;
    console.log(userId);
    console.log(columnName);
    console.log(newValue);
    
    if(!userId) return res.status(400).send('Insufficient Data.');

    try{
        const user = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if(user.rows.length < 1) return res.status(400).send('User not found');
        console.log('user found');
        await db.query(`UPDATE users SET ${columnName} = $1 WHERE user_id = $2`, [newValue, userId]);
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
        const user = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if(user.rows.length < 1) return res.status(404).send('User not found.');
        
        db.query('DELETE FROM users WHERE user_id = $1', [userId]);
        res.send(`${user.rows[0].email} deleted`);
        //res.json(userJson);
    }catch(err){
        res.status(500).send(err);
    }
});

module.exports = router;