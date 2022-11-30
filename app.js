require("dotenv").config();
require("express-async-errors"); //applies try and catch to all our controllers.
const express = require("express"); //import express.
const app = express(); // run express.

// rest of the packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
//database
const connectDB = require("./db/connect");

// routers
const authRouter = require("./Routes/authRoutes");
//middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
// to access middleware we use app.use().
app.use(morgan("tiny"));
app.use(express.json()); //we want to have access to the json data in our req.body.
app.use(cookieParser()); // enables us to have access to cookies in the req.cookies.

app.get("/", (req, res) => {
  // console.log(req.cookies);
  res.send("e-commerce api");
});

app.get("/api/v1", (req, res) => {
  console.log(req.cookies);
  res.send("e-commerce api");
});

app.use("/api/v1/auth", authRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

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
