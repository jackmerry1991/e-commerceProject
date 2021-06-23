require('dotenv').config('./.env');
const { response } = require('express');
const express = require('express');
const app = express();
const port = 3000; 
const db = require('./dbConnection.js')
const bodyParser = require('body-parser');
//user routes move to users.js after this initial test


app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

/**
 * Return all users
 */
app.get('/users', async (req, res) => {
    console.log('/user running');
    try{
        const result = await db.query('SELECT * FROM users');
        res.json(result.rows);

    }catch(err){
        return res.status(500).send('Internal server error');
    }
});

/**
 * Return single user
 */
app.get('/user/:id', async (req, res) => {
    console.log('/get-user running');
    const userId = req.params.id;
    console.log(req.params.id);
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
app.post('/user/create', async (req, res, next) => {
    
    const userDetails = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        street: street,
        city: city,
        password: password,
        postCode: postCode,
        } = req.body;
    try{
        const result = await db.query('INSERT INTO USERS(email, first_name, last_name, street, city, password, post_code) VALUES($1, $2, $3, $4, $5, $6, $7);', [email, firstName, lastName, street, city, password, postCode]);
        res.send(`User ${email} added successfully`);
    
    }catch(err){
        res.status(500).send('Error updating DB. Internal Server Error.');
        console.log(err);
    }   
});

/**
 * Update existing user
 */

/**
 * Delete existing user
 */
app.delete('/user/delete', async (req, res) => {
    const userId = req.body.userId;

    if(!userId) return res.status(400).send('Insufficent data provided.');

    try{
        const user = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        console.log('rows = ' + user);
        if(user.rows.length < 1) return res.status(404).send('User not found.');
        
        db.query('DELETE FROM users WHERE user_id = $1', [userId]);
        console.log(user);
        //res.status(200).send(`User ${user.rows} deleted`);
        const userJson = JSON.stringify(user);
        console.log(userJson);
        res.send(`${email} deleted`);
    }catch(err){
        res.status(500).send(err);
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

