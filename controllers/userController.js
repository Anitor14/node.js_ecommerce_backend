const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};
const getSingleUser = async (req, res) => {
  const {
    params: { id: userId }, // we destructure the params to get the userId.
  } = req;

  const user = await User.findOne({
    _id: userId,
  }).select("-password"); // we the find the user where _id is the userId. , and then we remove the password.
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id ${userId}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// update user with findOneAndUpdate.
// const updateUser = async (req, res) => {
//   const { email, name } = req.body;
//   if (!email || !name) {
//     throw new CustomError.BadRequestError("please provide all values");
//   }
//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email, name },
//     { new: true, runValidators: true }
//   );
//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({ res, user: tokenUser });
//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };

// update user with user.save();
const updateUser = async (req, res) => {
  const { email, name } = req.body; // we get the name and email from req.body.
  //we check if they are available.
  if (!email || !name) {
    throw new CustomError.BadRequestError("please provide all values");
  }

  const user = await User.findOne({ _id: req.user.userId }); // we find the user where _id = req.user.userId.

  user.email = email;
  user.name = name;

  // when we are using user.save(); we are triggering the save event hook.
  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("please fill in the password fields");
  }
  const user = await User.findOne({ _id: req.user.userId }); // we get the user .
  const isPasswordCorrect = await user.comparePassword(oldPassword); // checking if the old password is correct.
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }
  user.password = newPassword; // we replace the user password with the new one.

  await user.save(); // triggers the presave function on the user model..
  res.status(StatusCodes.OK).json({ msg: "Success! Password Updated." });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  showCurrentUser,
  updateUserPassword,
};
