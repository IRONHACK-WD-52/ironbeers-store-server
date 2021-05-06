const router = require("express").Router();
const ProductModel = require("../models/Product.model");

// Crud (CREATE) - HTTP POST
// Criar um novo usuário
router.post("/product", async (req, res) => {
  // Requisições do tipo POST tem uma propriedade especial chamada body, que carrega a informação enviada pelo cliente
  console.log(req.body);

  try {
    // Tira a propriedade image_url do objeto caso ela tenha um valor falso, para acionar o filtro de default value do Mongoose
    if (!req.body.image_url) {
      delete req.body.image_url;
    }

    // Salva os dados de usuário no banco de dados (MongoDB) usando o body da requisição como parâmetro
    const result = await ProductModel.create(req.body);

    // Responder o usuário recém-criado no banco para o cliente (solicitante). O status 201 significa Created
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    // O status 500 signifca Internal Server Error
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// cRud (READ) - HTTP GET
// Buscar todos os produtos
router.get("/product", async (req, res) => {
  try {
    // Buscar o usuário no banco pelo id
    const result = await ProductModel.find();

    console.log(result);

    if (result) {
      // Responder o cliente com os dados do usuário. O status 200 significa OK
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ msg: "Product not found." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// cRud (READ) - HTTP GET
// Buscar dados do usuário
router.get("/product/:id", async (req, res) => {
  try {
    // Extrair o parâmetro de rota para poder filtrar o usuário no banco

    const { id } = req.params;

    // Buscar o usuário no banco pelo id
    const result = await ProductModel.findOne({ _id: id });

    console.log(result);

    if (result) {
      // Responder o cliente com os dados do usuário. O status 200 significa OK
      return res.status(200).json(result);
    } else {
      return res.status(404).json({ msg: "Product not found." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// crUd (UPDATE) - HTTP PUT/PATCH
// Atualizar um usuário
router.put("/product/:id", async (req, res) => {
  try {
    // Extrair o id do usuário do parâmetro de rota
    const { id } = req.params;

    // Atualizar esse usuário específico no banco
    const result = await ProductModel.findOneAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true }
    );

    console.log(result);

    // Caso a busca não tenha encontrado resultados, retorne 404
    if (!result) {
      return res.status(404).json({ msg: "Product not found." });
    }

    // Responder com o usuário atualizado para o cliente
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// cruD (DELETE) - HTTP DELETE
// Deletar um usuário
router.delete("/product/:id", async (req, res) => {
  try {
    // Extrair o id do usuário do parâmetro de rota
    const { id } = req.params;

    // Deletar o usuário no banco
    const result = await ProductModel.deleteOne({ _id: id });

    console.log(result);

    // Caso a busca não tenha encontrado resultados, retorne 404
    if (result.n === 0) {
      return res.status(404).json({ msg: "Product not found." });
    }

    // Por convenção, em deleções retornamos um objeto vazio para descrever sucesso
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

module.exports = router;
