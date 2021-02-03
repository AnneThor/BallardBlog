const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcrypt");
var User = require("../models/User.js");
var Post = require("../models/Post.js");

module.exports = function(app, db) {
  app.get("/", (req, res) => {
    console.log("entered app get /");
    res.render(process.cwd()+"/views/pug/index", {username: req.user ? req.user.name : null})
  });

  //authenticate requests
  app.route("/login")
    .get(function(req, res){
      res.render(process.cwd()+"/views/pug/index", {showLogin: true})
    })
    .post(passport.authenticate("local", {failureRedirect: "/"}),
    function(req, res) {
      res.redirect("/messageBoard");
    }
  );

  //create new user
  app.route("/create-user")
    .post(function(req, res, next) {
      const hash = bcrypt.hashSync(req.body.password, 12);
      User.findOne({name: req.body.username}, function(err, user) {
        if(err){
          next(err);
        } else if (user) {
          res.redirect("/"); //user already exists, do not create
        } else {
          let newUser = new User({name: req.body.username, password: hash});
          User.create(newUser,
            function(err, user) {
              if (err) {
                res.redirect("/");
              } else {
                //we have created a new user
                next(null, user);
              }
            }
          )
        }
      })
    },
      passport.authenticate("local", {failureRedirect: "/"}),
        function(req,res,next) {
          res.redirect("/messageBoard");
        }
      );

  //logout user
  app.route("/logout")
    .get( function(req, res){
      //need to swap status of user
      req.logout();
      res.render(process.cwd()+"/views/pug/index", {currentUser: false, username: null});
    });

  app.route("/messageBoard")
    .get(ensureAuthenticated, function(req, res) {
      let posts = Post.find({})
        .limit(10)
        .exec( function(err, posts) {
          if (err) {
            console.log(err);
            res.render(process.cwd()+"/views/pug/messageBoard", {posts: null, username: req.user.name})
          }
          // console.log(`passing posts to messageboard`, posts);
          res.render(process.cwd()+"/views/pug/messageBoard", {"posts": posts, username: req.user.name});
        })
    });

  app.route("/new-post")
    .post(function(req,res) {
      var newPost = { title: req.body.title,
                      body: req.body.body,
                      user: req.user.name ? req.user.name : "Guest",
                      date: new Date()};
      Post.create(newPost, function(err, post) {
        if (err) { console.log(err)
                   res.redirect("/")}
        else {
          res.redirect("/messageBoard");
        }
      })
    })

  app.route("/delete-post/:id")
    .post(function(req, res) {
      Post.findByIdAndRemove({_id: req.params.id}, function (err, post) {
        if (err) {
          console.log(err);
        }
        res.redirect("/messageBoard");
      })
    })

  app.route("/edit-post/:id")
    .get(function(req, res) {
      Post.findById({_id: req.params.id}, function(err, post) {
        if (err) {
          console.log(err);
          res.redirect("/messageBoard");
        }
        res.render(process.cwd()+"/views/pug/editPost", {post: post})
      })
    })
    .post(function(req, res) {
      Post.findOneAndUpdate(
        {_id: req.params.id},
        { $set: { title: req.body.title, body: req.body.body, date: new Date()} },
        { new: true },
        function (err, updatedPost) {
          if (err) {
            console.log(err);
            res.redirect("/messageBoard");
          }
          console.log(updatedPost);
          res.redirect("/messageBoard");
        }
    )
  });

  app.route("/about")
    .get(function(req, res) {
      res.render(process.cwd()+"/views/pug/about", {username: req.user ? req.user.name : null});
    })

  //handle missing pages
  app.use(function(req, res, next){
    res.status(404)
      .type("text")
      .send(`${res.status} Page Not Found!`);
  });

}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
