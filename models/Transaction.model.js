const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  // ref é um atributo especial que aponta para o modelo que está criando um relacionamento com este modelo
  buyerId: { type: mongoose.Types.ObjectId, ref: "User" },
  products: [
    { qtt: Number, product: { type: mongoose.Types.ObjectId, ref: "Product" } },
  ],
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
