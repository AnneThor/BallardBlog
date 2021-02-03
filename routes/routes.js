const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcrypt");
var User = require("../models/User.js");
var Post = require("../models/Post.js");


module.exports = function(app, db) {
  app.get("/", (req, res) => {
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
      req.logout();
      res.render(process.cwd()+"/views/pug/index", {currentUser: false, username: null});
    });

  //display all current posts (actually limited to 10 most recent);
  //should end logic to sort them before limiting since they're not ordered in db
  app.route("/messageBoard")
    .get(ensureAuthenticated, function(req, res) {
      let posts = Post.find({})
        .limit(10)
        .exec( function(err, posts) {
          if (err) {
            console.log(err);
            res.render(process.cwd()+"/views/pug/messageBoard", {posts: null, username: req.user.name})
          }
          res.render(process.cwd()+"/views/pug/messageBoard", {"posts": posts, username: req.user.name});
        })
    });

  //create new post and save to db
  //if there is an error, routes back to message board w/no actions
  app.route("/new-post")
    .post(function(req,res) {
      var newPost = { title: req.body.title,
                      body: req.body.body,
                      user: req.user.name ? req.user.name : "Guest",
                      date: new Date()};
      Post.create(newPost, function(err, post) {
        if (err) { console.log(err)
                   res.redirect("/messageBoard")}
        else {
          res.redirect("/messageBoard");
        }
      })
    })

  //delete a post (only visible to user who created the post)
  app.route("/delete-post/:id")
    .post(function(req, res) {
      Post.findByIdAndRemove({_id: req.params.id}, function (err, post) {
        if (err) {
          console.log(err);
        }
        res.redirect("/messageBoard");
      })
    })

  //edit post (only visible to author of post)
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

  //view one post and it's associated comment(s)
  app.route("/post-detail/:id")
    .get( (req, res) => {
      Post.findById( {_id: req.params.id}, (err, post) => {
        if (err) {
          res.redirect("/messageBoard");
        }
        res.render(process.cwd()+ "/views/pug/post", {post: post})
      })
    })

  //add new comment to a post
  app.route("/new-comment/:id")
    .post( (req, res) => {
      let newComment = {
        body: req.body.comment,
        user: req.user.name,
        date: new Date()
      };
      Post.findOneAndUpdate(
        {_id: req.params.id},
        { $push: { comments: newComment} },
        { new: true }, //turned that on for testing, to check if posts were updating
      function (err, updatedPost) {
        if (err) {
          console.log(err);
          res.redirect("/messageBoard");
        }
        res.redirect("/post-detail/"+req.params.id);
      })
    });

  //display about page
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
