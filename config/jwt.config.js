const jwt = require("jsonwebtoken");

module.exports = function generateToken(user) {
  const data = {
    _id: user._id,
    name: user.name,
    email: user.email,
  };
  const signature = "keyboard_cat";
  const expiration = "6h";

  return jwt.sign({ data }, signature, {
    expiresIn: expiration,
  });
};
