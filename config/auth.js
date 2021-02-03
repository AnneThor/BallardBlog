const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcrypt");
var LocalStrategy = require("passport-local");
const User = require("../models/User.js");


module.exports = function(app, db) {
  passport.serializeUser(function(user,done){
    done(null, user._id);
  })

  passport.deserializeUser(function(id,done) {
    User.findOne({_id: id}, function(err, user) {
      if(err){return console.error(err)}
      done(null, user);
    })
  });

  //need to add better handling of errors here so user knows what went wrong
  //passwords are hashed so they're not stored/sent to db
  passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({name: username}, function(err, user) {
        console.log(`User ${username} attempted to log in.`);
        if(err){
          console.log(err);
          return done(err);}
        if(!user){
          console.log("no such user");
          return done(null, false);}
        if(!bcrypt.compareSync(password, user.password)){
          console.log("password mismatch");
          return done(null, false);}
        user.online = true;
        user.save();
        done(null, user);
      })
    })
  )

}
