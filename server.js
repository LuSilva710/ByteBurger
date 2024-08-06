var express = require("express");
const session = require("express-session");
const { createHash } = require("crypto");
var app = express();

// set the view engine to ejs
app.set("view engine", "ejs");
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./public"));
app.set("views", "./views");

// use res.render to load up an ejs view file

// login page
app.get("/", function (req, res) {
  res.render("pages/login");
});

// home page
app.get("/home", function (req, res) {
  res.render("pages/home");
});

// database auth
app.post("/auth", function (req, res) {
  // Criar a função de autenticação do usuário
});

app.post("/register", function (req, res) {
  // Criar a função de registro do usuário
});

app.listen(8080);
console.log("Server is listening on port 8080");
