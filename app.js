// Configurando o servidor para ter acesso às variáveis de ambiente do sistema operacional
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Importando as configurações do banco de dados e inicializando a conexão
const db = require("./config/db.config");
db();

// Configurar o express para entender requisições contendo JSON no corpo
app.use(express.json());

// Configurar o CORS (Cross-Origin-Resource-Sharing) para permitir que o nosso cliente React acesse este servidor de um domínio diferente
app.use(cors({ origin: process.env.REACT_APP_URL }));

// Importa e configura nossas rotas
const userRouter = require("./routes/user.routes");

app.use("/", userRouter);

const productRouter = require("./routes/product.routes");
app.use("/", productRouter);

const transactionRouter = require("./routes/transaction.routes");
app.use("/", transactionRouter);

// Inicia o servidor para escutar requisições HTTP na porta 4000
app.listen(Number(process.env.PORT), () =>
  console.log(`Server up and running at port ${process.env.PORT}`)
);
