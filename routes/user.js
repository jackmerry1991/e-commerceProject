const bodyParser = require('body-parser');
const UserController = require('../controllers/userController');
const user = new UserController();
const express = require('express');
const { isRejected } = require('@reduxjs/toolkit');
const app = express();
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');


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
router.get('/users', user.list);

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
router.get('/:id', user.findUserById);

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
router.post('/register', user.create);


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
router.put('/', user.update);


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
router.post('/login', (req, res, next)=>{
    console.log('/login');
    console.log(req);
     passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({
                message: 'Something is not right',
                user   : user
            });
        }
       req.login(user, {session: false}, (err) => {
           if (err) {
               res.send(err);
           }
           // generate a signed son web token with the contents of user object and return it in the response
           const token = jwt.sign({
            user,
           },
             process.env.SECRET, {expiresIn: '2h'});
             res.cookie('token', token, { httpOnly: true });
           return res.json({token});
        });
    })(req, res, next);
});


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
router.delete('/delete', user.delete);

module.exports = router;