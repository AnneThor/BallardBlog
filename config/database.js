require("dotenv").config();
const mongoose = require("mongoose");

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

}

module.exports = dbConnect;
