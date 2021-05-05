const express = require("express");

const PORT = 4000;

const app = express();

const db = require("./config/db.config");
db();

// Configurar o express para entender requisições contendo JSON
app.use(express.json());

const userRouter = require("./routes/user.routes");

app.use("/", userRouter);

app.listen(PORT, () => console.log(`Server up and running at port ${PORT}`));
