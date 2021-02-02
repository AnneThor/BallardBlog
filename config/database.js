require("dotenv").config();
const mongoose = require("mongoose");

// mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

async function dbConnect() {
  mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
  const db = mongoose.connection;

  try {
    await db.once("open", function() {
      console.log("you are connected");
    })
  } catch (e) {
    console.error(e);
    throw new Error("unable to connect to database")
  }


  // //needs to be adjusted to guarantee info cannot be requested before connection is made
  // db.on("error", console.error.bind(console, "connection error"));
  // db.once("open", function() {
  //   console.log("you are connected!");
  // })
}

module.exports = dbConnect;
