const router = require("express").Router();
const TransactionModel = require("../models/Transaction.model");
const UserModel = require("../models/User.model");
const ProductModel = require("../models/Product.model");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Criar uma sessão de Checkout no Stripe
router.post("/create-checkout-session", async (req, res) => {
  // Array para segurar dados dos produtos
  const line_items = [];

  try {
    // Antes de liberar a venda, verifica se tem quantidade em estoque
    for (let product of req.body.products) {
      const foundProduct = await ProductModel.findOne({
        _id: product.productId,
      });

      if (product.qtt > foundProduct.qtt_in_stock) {
        return res.status(403).json({ msg: "Not enough quantity in stock" });
      }

      // Esse formato de objeto é o formato requerido pela API do Stripe
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: foundProduct.name,
            images: [foundProduct.image_url],
          },
          unit_amount: parseInt(foundProduct.price * 100),
        },
        quantity: product.qtt,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [...line_items],
      mode: "payment",
      success_url: `${process.env.REACT_APP_URL}/order/success`,
      cancel_url: `${process.env.REACT_APP_URL}/order/canceled`,
    });

    return res.status(201).json({ id: session.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Failed to create checkout session." });
  }
});

// Criar uma nova transação (compra)
router.post("/transaction", async (req, res) => {
  try {
    // Criar a transação
    const result = await TransactionModel.create(req.body);

    // Atualizar as transações deste usuário
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.body.buyerId },
      { $push: { transactions: result._id } }
    );

    console.log(updatedUser);

    // Atualizar as transações de cada produto

    for (let product of req.body.products) {
      await ProductModel.findOneAndUpdate(
        { _id: product.productId },
        // $inc é o operador de incremento: ele vai subtrair ou adicionar desse campo a quantidade informada
        {
          $push: { transactions: result._id },
          // Atualizar os estoques dos produtos
          $inc: { qtt_in_stock: -product.qtt },
        }
      );
    }

    // Responde o resultado pro cliente
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// Recuperar detalhes da transação
router.get("/transaction/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar os dados da transação usando o id da URL
    const result = await TransactionModel.findOne({ _id: id }).populate({
      path: "products.productId",
      model: "Product",
    });

    console.log(result);

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

module.exports = router;
