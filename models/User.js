const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "Please provide name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    require: [true, "Please provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
  },
  password: {
    type: String,
    require: [true, "Please provide password"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

// setting up our pre hook
// this is what happens before saving our document.
// this points back to the user.
UserSchema.pre("save", async function () {
  // console.log(this.modifiedPaths()); // shows you the paths that have been modified.
  // console.log(this.isModified("name")); // shows
  if (!this.isModified("password")) return; // we are returning cause we don't want to hash the password again if it is not being modified.
  const salt = await bcrypt.genSalt(10); // generate random bytes.
  this.password = await bcrypt.hash(this.password, salt); //hashing the password with the salt.
});

//setting up a function that compares this password.
//setting up instance method.
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
