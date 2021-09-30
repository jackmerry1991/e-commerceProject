require('dotenv').config('./.env');
const path = require('path');
const session = require('express-session');
const express = require('express');
const passport = require('passport');
const indexRouter = require('./routes/index');
const swaggerJSDoc = require('swagger-jsdoc');

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
const port = 8000; 
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');
app.use(express.static(path.join(__dirname, 'public')));

//user routes move to users.js after this initial test
app.use('/', indexRouter);
// serve swagger
app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

