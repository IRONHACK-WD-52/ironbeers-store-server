const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phoneNumber: { type: String, required: true, trim: true },
  addresses: [
    new mongoose.Schema(
      {
        street: { type: String, required: true, trim: true },
        neighbourhood: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        postCode: { type: String, required: true, trim: true },
        stateOrProvince: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
      },
      { _id: false }
    ),
  ],
});

module.exports = mongoose.model("User", UserSchema);
