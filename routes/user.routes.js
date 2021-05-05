const router = require("express").Router();
const UserModel = require("../models/User.model");

// Criar um novo usuário

router.post("/signup", async (req, res) => {
  try {
    const createdUser = await UserModel.create(req.body);

    console.log(createdUser);

    // const { address, email, name, phoneNumber } = req.body;

    // const updatedUser = await UserModel.findOneAndUpdate(
    //   { _id: createdUser._id },
    //   { $push: { addresses: address } },
    //   { new: true }
    // );

    // console.log(updatedUser);

    return res.status(201).json(createdUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: err });
  }
});

module.exports = router;
