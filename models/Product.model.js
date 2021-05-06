const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  tagline: { type: String, required: true, trim: true },
  first_brewed: { type: String, required: true, maxlength: 7, minlength: 7 },
  description: { type: String, maxlength: 500 },
  image_url: { type: String, default: "https://images.punkapi.com/v2/keg.png" },
  abv: { type: Number, required: true },
  food_pairing: [String],
  contributed_by: String,
  cost: { type: Number, required: true },
  price: { type: Number, required: true },
  qtt_in_stock: { type: Number, required: true },
  volume: { type: Number, required: true },
  expire_date: { type: Date, required: true },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
});

module.exports = mongoose.model("Product", ProductSchema);
