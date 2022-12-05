const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};
// is this love, is this love , that i am feeling , what is the iss
const getSingleUser = async (req, res) => {
  const {
    params: { id: userId },
  } = req;

  const user = await User.findOne({
    _id: userId,
  }).select("-password");
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id ${userId}`);
  }
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.send("show the current user.");
};

const updateUser = async (req, res) => {
  res.send("update the current user.");
};

const updateUserPassword = async (req, res) => {
  res.send("update the user password.");
};

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  showCurrentUser,
  updateUserPassword,
};
