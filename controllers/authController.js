const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");

const register = async (req, res) => {
  const { email, name, password } = req.body;
  const emailAlreadyExists = await User.findOne({ email }); // returns a promise with a boolean value.

  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exist"); // this happens if the email already exists.
  }

  const isFirstAccount = (await User.countDocuments({})) === 0; // check if there is any accounts.
  const role = isFirstAccount ? "admin" : "user";

  //creating the user.
  const user = await User.create({ name, email, password, role }); // creating the new user.
  // creating a tokenUser from the user.
  const tokenUser = createTokenUser(user);
  //attaching the cookies to the response
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("please provide email and password");
  }
  const user = await User.findOne({ email }); //returns a boolean.
  if (!user) {
    throw new UnauthenticatedError("invalid Credentials");
  }

  //compare password
  const isPasswordCorrect = await user.comparePassword(password);
  //accessing the user instance method.
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("invalid Credentials");
  }

  // creating a tokenUser from the user.
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  // change the name used to store the token , and then set the expiry date to now.
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out" });
};

module.exports = {
  register, //exporting the register,login and logout routes.
  login,
  logout,
};
