require('dotenv').config('./.env');
const { response } = require('express');
const express = require('express');
const app = express();
const port = 3000; 
const db = require('./dbConnection.js')

//user routes move to users.js after this initial test

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


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

