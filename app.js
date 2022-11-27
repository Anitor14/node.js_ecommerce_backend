require("dotenv").config();
const express = require("express"); //import express.
const app = express(); // run express.

//database
const connectDB = require("./db/connect");
const port = process.env.port || 3000; //define port.

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, console.log(`Server is listening on ${port}`)); // listen on the server.
  } catch (error) {
    console.log(error);
  }
};

start();
