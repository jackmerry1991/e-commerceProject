require('dotenv').config('./.env');
const { response } = require('express');
const express = require('express');
const app = express();
const port = 3000; 
const db = require('./dbConnection.js')


app.get('/test', async (req, res) => {
    console.log('/test running');
    try{
        const result = await db.query('SELECT * FROM users');
        res.json(result.rows);

    }catch(err){
        return res.status(500).send('Internal server error');
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

