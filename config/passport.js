const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require("../controllers/userController");
const user = new User();


module.exports = function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
      const user = await user.findUserByEmail(email)
      if (user == null) {
        return done(null, false, { message: 'No user with that email' })
      }
  
      try {
          console.log('pwd = ' + password + ' userpwd = ' + user.password);
        if (await bcrypt.compare(password, user.password)) {
            console.log('match');
          return done(null, user)
        } else {
            console.log('no match');
          return done(null, false, { message: 'Password incorrect' })
        }
      } catch (e) {
        return done(e)
      }
    }
  
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.user_id))
    passport.deserializeUser((id, done) => {
      return done(null, user.findUserById(id))
    })
  }
  






// module.exports = function(passport) {
//     passport.use(
//         new LocalStrategy({usernameField : 'email'},(email,password,done)=> {
//                 //match user
//                 user.findUserByEmail(email)
//                 .then((user)=>{
//                  if(!user) {
//                      console.log('user not registered');
//                      return done(null,false,{message : 'that email is not registered'});
//                  }
//                  //match pass
//                  console.log(password + ' ' + user.password);
//                  bcrypt.compare(password,user.password,(err,isMatch)=>{
//                      if(err) throw err;

//                      if(isMatch) {
//                          console.log('pwd match');
//                          return done(null,user);
//                      } else {
//                          return done(null,false,{message : 'pass incorrect'});
//                      }
//                  })
//                 })
//                 .catch((err)=> {console.log(err)})
//         })
        
//     )
//     // passport.serializeUser(function(user, done) {
//     //     console.log('serialize');
//     //     done(null, user.user_id);
//     //   });
      
//     // passport.deserializeUser(async (id, done) => {
//     //     console.log('deserialize');
//     //     const user = await user.findUserById(id);
        
//     //     const finish = (err, user) => {
//     //     console.log('done');
//     //     done(err, user);
//     //     };
//     //     finish(user);
//     //   }); 

//     passport.serializeUser((user, done) => done(null, user.user_id))
//     passport.deserializeUser((id, done) => {
//       return done(null, findUserById(id))
//     })
// }; 