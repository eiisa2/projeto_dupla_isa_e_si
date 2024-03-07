// Config inicial (requires) / imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();

const userModel = require("./models/user.model");

// Forma de ler JSON / Middlewares
app.use(
    express.urlencoded({
    extended: true,
    })
);

app.use(express.json());

app.use((req, res, next) => {
    console.log(`Request Type: ${req.method}`);
    console.log(`Content Type: ${req.headers["content-type"]}`); 
    console.log(`Date: ${new Date()}`);
    next();
});


// Middlewares
app.use(express.static("index.html")); 
app.use((req, res, next) => {
  console.log(`Request Type: ${req.method}`);
  console.log(`Content Type: ${req.headers["content-type"]}`);
  console.log(`Date: ${new Date()}`);

  next();
});


// rota pública - rota aberta - página login
app.get("/", (req, res) => {
    res.sendFile(__dirname + "index.html/conta/account.html");
  });
  
  // rotas privadas - rota fechada
  app.get("/index.html?:user", (req, res) => {
    const user = req.params.user;
    res.sendFile(__dirname + "/intex.html/home/index.html");
  });
  
  app.post("/user/:user", checkToken, async (req, res) => {
    const user = req.params.user;
  
    // Checar se usuário existe
    const usuario = await userModel.findOne(
      {
        user: user,
      },
      "- senha -email"
    ); 
  
    if (!usuario) {
      return res.status(404).json({
        msg: "Usuário não encontrado",
      });
    }
    res.status(200).json({ usuario });
  });
  
  function checkToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({
        msg: "Acesso negado", 
      });
    }
  
    try {
      const Segredo = process.env.SEGREDO;
      jwt.verify(token, Segredo);
  
      next();
    } catch (error) {
      res.status(400).json({
        msg: "Token invalido!",
      });
    }
  }

// rotas da API bolsa
const BolsaRoutes = require("./routes/BolsaRoutes");

app.use("/bolsa", BolsaRoutes);

// rotas da API cadastro
const authRoute = require("./routes/authRoute");
app.use("/auth", authRoute);


// rotas iniciais / ednpoints 
app.get("/", (req, res) => {
    res.json({ msg: "Teste de express!" });
});

// entregar uma porta / iniciar servidor 
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD; 
const database = "bancoAPI";

mongoose
    .connect(
        `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.aysrxmg.mongodb.net/${database}?
    retryWrites=true&w=majority`
    )
    .then(() => {
    console.log("Conectado ao MongoDB Atlas com sucesso!");
    app.listen(8080);
    })
    .catch((err) => console.log(err));
 
