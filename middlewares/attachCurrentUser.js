const UserModel = require("../models/User.model");

module.exports = async (req, res, next) => {
  try {
    const decodedTokenData = req.token.data;
    // console.log("USER => ", req);
    const userRecord = await UserModel.findOne({ _id: decodedTokenData._id });

    req.currentUser = userRecord;

    if (!userRecord) {
      return res.status(401).end("User not found");
    } else {
      return next();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
};
