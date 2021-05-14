const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const UserModel = require("../models/User.model");
const TokenModel = require("../models/Token.model");
const generateToken = require("../config/jwt.config");
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const mailer = require("../config/nodemailer.config");

const salt_rounds = 10;

// Crud (CREATE) - HTTP POST
// Criar um novo usuário
router.post("/signup", async (req, res) => {
  // Requisições do tipo POST tem uma propriedade especial chamada body, que carrega a informação enviada pelo cliente
  console.log(req.body);

  try {
    // Recuperar a senha que está vindo do corpo da requisição
    const { password } = req.body;

    // Verifica se a senha não está em branco ou se a senha não é complexa o suficiente
    if (
      !password ||
      !password.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/
      )
    ) {
      // O código 400 significa Bad Request
      return res.status(400).json({
        msg: "Password is required and must have at least 8 characters, uppercase and lowercase letters, numbers and special characters.",
      });
    }

    // Gera o salt
    const salt = await bcrypt.genSalt(salt_rounds);

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, salt);

    // Salva os dados de usuário no banco de dados (MongoDB) usando o body da requisição como parâmetro
    const result = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });

    // Responder o usuário recém-criado no banco para o cliente (solicitante). O status 201 significa Created
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    // O status 500 signifca Internal Server Error
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    // Extraindo o email e senha do corpo da requisição
    const { email, password } = req.body;

    // Pesquisar esse usuário no banco pelo email
    const user = await UserModel.findOne({ email });

    console.log(user);

    // Se o usuário não foi encontrado, significa que ele não é cadastrado
    if (!user) {
      return res
        .status(400)
        .json({ msg: "This email is not yet registered in our website;" });
    }

    // Verificar se a senha do usuário pesquisado bate com a senha recebida pelo formulário

    if (await bcrypt.compare(password, user.passwordHash)) {
      // Gerando o JWT com os dados do usuário que acabou de logar
      const token = generateToken(user);

      return res.status(200).json({
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
          role: user.role,
        },
        token,
      });
    } else {
      // 401 Significa Unauthorized
      return res.status(401).json({ msg: "Wrong password or email" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// cRud (READ) - HTTP GET
// Buscar dados do usuário
router.get("/profile", isAuthenticated, attachCurrentUser, (req, res) => {
  console.log(req.headers);

  try {
    // Buscar o usuário logado que está disponível através do middleware attachCurrentUser
    const loggedInUser = req.currentUser;

    if (loggedInUser) {
      // Responder o cliente com os dados do usuário. O status 200 significa OK
      return res.status(200).json(loggedInUser);
    } else {
      return res.status(404).json({ msg: "User not found." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// Password Reset - Troca de senha segura
router.post("/forgot-password", async (req, res) => {
  try {
    // Verifica se o usuário existe no banco através do e-mail

    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "This is user is not registered in our application." });
    }

    // Verifica se existe um token de troca de senha ativo no banco pra esse usuário
    const token = await TokenModel.findOne({ userId: user._id });

    // Caso exista um token para esse usuário, delete antes de criar um novo
    if (token) {
      await TokenModel.deleteOne({ _id: token._id });
    }

    // Gerar o token de troca de senha e salvar no banco
    const resetToken = uuidv4();

    await TokenModel.create({ token: resetToken, userId: user._id });
    // Invalida a senha anterior do usuário para que ninguém mais possa acessar a conta
    await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $set: { passwordHash: uuidv4() } }
    );

    const passwordResetLink = `${process.env.REACT_APP_URL}/password-reset?token=${resetToken}&userId=${user._id}`;

    await mailer(
      req.body.email,
      "Forgot your password to access Ironbeers Store?",
      `
      <p>You requested a password reset. Click in the link below to reset your password. If you didn't ask for this, please ignore this e-mail.</p>

      <a href="${passwordResetLink}">Click here to reset you password</a>

      <p>Or copy and paste this into your browser: ${passwordResetLink}</p>
    `
    );

    return res.status(200).json({ msg: "OK" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

router.post("/password-reset", async (req, res) => {
  try {
    const { password, token, userId } = req.body;

    // Verifica se o token enviado pelo usuário é o mesmo token que foi gerado pelo nosso servidor
    const foundToken = await TokenModel.findOne({ token });

    if (!foundToken) {
      return res.status(401).json({ msg: "Invalid password reset token." });
    }

    const user = await UserModel.findOne({ _id: userId });

    if (!user) {
      return res
        .status(401)
        .json({ msg: "This user is not registered in our application." });
    }

    // Verifica se a senha não está em branco ou se a senha não é complexa o suficiente
    if (
      !password ||
      !password.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/
      )
    ) {
      // O código 400 significa Bad Request
      return res.status(400).json({
        msg: "Password is required and must have at least 8 characters, uppercase and lowercase letters, numbers and special characters.",
      });
    }

    // Gera o salt
    const salt = await bcrypt.genSalt(salt_rounds);

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, salt);

    // Atualiza a senha no banco pra este usuário
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: { passwordHash: hashedPassword } }
    );

    console.log(updatedUser);

    return res.status(200).json({ msg: "Password reset successful." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

// crUd (UPDATE) - HTTP PUT/PATCH
// Atualizar um usuário
router.put("/user/:id", async (req, res) => {
  try {
    // Extrair o id do usuário do parâmetro de rota
    const { id } = req.params;

    // Atualizar esse usuário específico no banco
    const result = await UserModel.findOneAndUpdate(
      { _id: id },
      { $set: req.body },
      { new: true }
    );

    console.log(result);

    // Caso a busca não tenha encontrado resultados, retorne 404
    if (!result) {
      return res.status(404).json({ msg: "User not found." });
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
router.delete("/user/:id", async (req, res) => {
  try {
    // Extrair o id do usuário do parâmetro de rota
    const { id } = req.params;

    // Deletar o usuário no banco
    const result = await UserModel.deleteOne({ _id: id });

    console.log(result);

    // Caso a busca não tenha encontrado resultados, retorne 404
    if (result.n === 0) {
      return res.status(404).json({ msg: "User not found." });
    }

    // Por convenção, em deleções retornamos um objeto vazio para descrever sucesso
    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: JSON.stringify(err) });
  }
});

module.exports = router;
