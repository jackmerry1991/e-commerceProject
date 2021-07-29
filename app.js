require('dotenv').config('./.env');
const user = require('./routes/user.js');
const product = require('./routes/products.js');
const cart = require('./routes/cart.js');
const order = require('./routes/order.js');
const path = require('path');
const session = require('express-session');
const express = require('express');
const passport = require('passport');
const swaggerJSDoc = require('swagger-jsdoc');
require("./config/passport")(passport);

const app = express();
// swagger definition
const swaggerDefinition = {
    info: {
      title: 'Node Swagger API',
      version: '1.0.0',
      description: 'Demonstrating how to describe a RESTful API with Swagger',
    },
    host: 'localhost:3000',
    basePath: '/',
  };
  
// options for the swagger docs
const options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./routes/*.js'],
  };
  
// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);
const port = 3000; 
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

//user routes move to users.js after this initial test
app.use('/user', user);
app.use('/products', product);
app.use('/carts', cart);
app.use('/orders', order);
// serve swagger
app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

