const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/').User;
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, 
     async (email, password, cb) => {
       console.log('/passport');
        //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
        const user = await User.findOne({
          attributes: ['id', 'email', 'password'],
          where: {email: email}
        });
        console.log('user =')
        console.log(user);
        if(!user) return cb(null, false, {message: 'Incorrect email or password.'})
        const passwordMatch = await bcrypt.compare(password, user.dataValues.password);
        console.log(passwordMatch);
        if (!passwordMatch) {
          return cb(null, false, {message: 'Incorrect email or password.'});
        }
        const returnedUser = {id: user.dataValues.id, email: user.dataValues.email}
        return cb(null, returnedUser, {message: 'Logged In Successfully'});
    }));

