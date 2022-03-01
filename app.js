require("dotenv").config("./.env");
const path = require("path");
const session = require("express-session");
const express = require("express");
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const passport = require("passport");
const indexRouter = require("./routes/index");
const swaggerJSDoc = require("swagger-jsdoc");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
// swagger definition
const swaggerDefinition = {
  info: {
    title: "Node Swagger API",
    version: "1.0.0",
    description: "Demonstrating how to describe a RESTful API with Swagger",
  },
  host: "localhost:3000",
  basePath: "/",
};

// options for the swagger docs
const options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ["./routes/*.js"],
};

// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);
const port = 8000;
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads/images", express.static(__dirname + '/uploads/images'));
app.use(jsonParser);
const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(",")
  : []

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },

  credentials: true,
}

app.use(cors(corsOptions));
app.use(cookieParser(process.env.COOKIE_SECRET))

//user routes move to users.js after this initial test
app.use("/", indexRouter);

// serve swagger
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
