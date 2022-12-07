const CustomError = require("../errors");

const checkPermissions = (requestUser, resourceUserId) => {
  //   console.log(requestUser);
  //   console.log(resourceUserId);
  //   console.log(typeof resourceUserId);
  if (requestUser.role === "admin") return; // if the user is an admin you can access the route.
  if (requestUser.userId === resourceUserId.toString()) return; // if the user is not an admin but the requestId and the resourceUserId are the same.
  throw new CustomError.UnauthorizedError(
    "Not authorized to access this route"
  );
};

module.exports = checkPermissions;
