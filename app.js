const express = require("express");
var session = require("express-session");
var passport = require("passport");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local");
const app = express();
const port = 3000;
const routes = require("./routes/routes.js");
const auth = require("./config/auth.js");
const dbConnect = require("./config/database.js");

//allows acces to variables in .env file
require("dotenv").config();

app.set("view engine", "pug");

app.use(express.static(process.cwd()+ "/public"));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(cookieSession({
  name: "session", keys: ["key1", "key2"]
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false,
           maxAge: (1000*60*60)
         }
}));
app.use(passport.initialize());
app.use(passport.session());



//need to adjust so this fires first
const db = dbConnect();
routes(app, db);
auth(app, db);

app.listen(port, () => {
  console.log(`Example server listening at http://localhost:${port}`);
})
