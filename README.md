# e-commerceProject back-end

## Contents
* [About Project](#about-project)
* [Built With](#built-with)
* [Installation](#installation)

## About Project
This project uses [ExpressJs](#https://expressjs.com/) to build a backend for my [e-commerce-front-end project](#https://github.com/jackmerry1991/e-commerce-front-end). The project uses [Sequelize](#https://sequelize.org/), an ORM, to interact with a PostgreSql database which is used to store user, product, cart and order details. User's are able register and login using [Passport](#https://www.npmjs.com/package/passport) and a JWT is then returned to the user, [Stripe](#https://stripe.com/docs) is used to handle payments on the back-end, Stripe documentation can be used to find the details of cards that can be used for testing purposes. Routes related to administrator use-cases are not yet complete and still require authorisation middleware to be added. These routes focus on CRUD operations related to products, such as the storing of product data and uploading product images using [multer](#https://www.npmjs.com/package/multer). It is currently possible to use these routes, e.g. via Postman, to more easily fill the database for testing purposes.

## Built With
* [ExpressJs](#https://expressjs.com/)
* [Sequelize](#https://sequelize.org/)
* [Stripe](#https://stripe.com/docs)

## Installation

1. Install the application's node dependencies. 
    `npm install`
2. Copy the .env-example file and fill in all variables with the information required.
3. Run sequelize migrations
  `npx sequelize-cli db:migrate`
4. Run the application.
    `node app.js`
