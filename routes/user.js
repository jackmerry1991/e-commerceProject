const bodyParser = require('body-parser');
const userModel = require('../models/userModel');
const userModelInstance = new userModel();
const express = require('express');
const { isRejected } = require('@reduxjs/toolkit');
const app = express();
const router = express.Router();
const passport = require('passport');



router.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
router.use(bodyParser.json());

/**
 * @swagger
 * /user/users:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns an array of users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: All Users
 *         schema:
 *           $ref: '#/definitions/User'
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
 * @swagger
 * /User/{id}:
 *   get:
 *     tags:
 *       - Users
 *     description: Returns a single user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: User's id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: A single user
 *         schema:
 *           $ref: '#/definitions/User'
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
 * @swagger
 * /user/register:
 *   post:
 *     tags:
 *       - Users
 *     description: Creates a new user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: firstName
 *         description: user's first name
 *         in: body
 *         required: true
 *       - name: lastName
 *         description: user's last name
 *         in: body
 *         required: true
 *       - name: email
 *         description: user's email address
 *         in: body
 *         required: true
 *       - name: street
 *         description: user's street name
 *         in: body
 *         required: true
 *       - name: city
 *         description: user's city name
 *         in: body
 *         required: true
 *       - name: postcode
 *         description: user's postcode
 *         in: body
 *         required: true
 *       - name: password
 *         description: user's password encrypted
 *         in: body
 *         required: true
 *       - name: paymentDetails
 *         description: user's payment details
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: Successfully created
 */
router.post('/register', async (req, res, next) => {
    console.log('/register');
    const userDetails = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        street: street,
        city: city,
        password: password,
        postCode: postCode,
        paymentDetails: paymentDetails
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
* @swagger
* /user/:
*   put:
*     tags: User
*     description: Updates a single user
*     produces: application/json
*     parameters:
*      - name: userId
*        in: body
*        description: Id of the user to be updated
*      - name: columnToUpdate
*        in: body
*        description: column of the user table to be updated
*      - name: newValue
*        in: body
*        description: New value to be inserted into the column
*        schema:
*         type: array
*         $ref: '#/definitions/User'
*     responses:
*       200:
*         description: Successfully updated
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
 * @swagger
 * /users/login:
 *   post:
 *     tags: User
 *     description: User login
 *     produces: redirect
 *     parameters:
 *      - name: email
 *        in: body
 *        description: user's email address
 *      - name: password
 *        in: body
 *        description: user's password
 *        schema:
 *         type: array
 *         $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: Redirect
 */
router.post('/login',(req,res,next)=>{
    console.log('/login');
    passport.authenticate('local',{
        successRedirect : '/dashboard',
        failureRedirect: '/users/login',
    })(req,res,next)
    })

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     tags:
 *       - User
 *     description: Deletes a single user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: User's id
 *         in: body
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: successfully deleted
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