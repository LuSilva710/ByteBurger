var express = require("express");
const session = require("express-session");
const mysql = require("mysql2");
var connection_data = require("./connections.json");
const connection = mysql.createConnection(connection_data);
const { createHash } = require("crypto");
var app = express();

// Conectando ao banco de dados
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');
});

// Configurando o view engine
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

// Rota de login
app.get("/", function (req, res) {
  res.render("pages/login");
});

// Rota da página inicial
app.get("/home", function (req, res) {
  if (req.session.loggedin) {
    res.render("pages/home");
  } else {
    res.send("Por favor, faça login para ver esta página!");
  }
});

app.post("/auth", function (req, res) {
  let email = req.body.email;
  let password = req.body.senha;

  console.log("Autenticando usuário:");
  console.log("Email recebido:", email);
  console.log("Senha recebida:", password);

  let cripted_pass = hash(email + password);
  console.log("Senha criptografada esperada:", cripted_pass);

  if (email && password) {
    connection.query(
      "SELECT * FROM usuario WHERE email = ?",
      [email],
      function (error, results, fields) {
        if (error) {
          console.error("Erro na query:", error);
          res.send("Ocorreu um erro durante a autenticação.");
          return;
        }

        console.log("Resultados da query:", results);

        if (results.length > 0) {
          console.log("Senha no banco de dados:", results[0].senha);
          if (results[0].senha === cripted_pass) {
            req.session.loggedin = true;
            req.session.username = email;
            res.redirect("/home");
          } else {
            res.send("Email ou Senha Incorretos!");
          }
        } else {
          res.send("Email ou Senha Incorretos!");
        }
        res.end();
      }
    );
  } else {
    res.send("Por favor, preencha ambos os campos!");
    res.end();
  }
});


app.post("/register", function (req, res) {
  let username = req.body.nome;
  let password = req.body.senha[0];
  let email = req.body.email;
  let cripted_pass = hash(email + password);

  console.log("Registrando novo usuário:");
  console.log("Nome:", username);
  console.log("Email:", email);
  console.log("Senha original:", password);
  console.log("Senha criptografada:", cripted_pass);

  if (username && password && email) {
    connection.query(
      "SELECT * FROM usuario WHERE email = ?",
      [email],
      function (error, results, fields) {
        if (error) {
          console.error("Erro na query:", error);
          res.send("Ocorreu um erro durante o registro.");
          return;
        }

        if (results.length > 0) {
          res.send("Este e-mail já está cadastrado. Por favor, escolha outro.");
        } else {
          connection.query(
            "INSERT INTO usuario (nome, email, senha) VALUES(?, ?, ?);",
            [username, email, cripted_pass],
            function (error, results, fields) {
              if (error) {
                console.error("Erro ao inserir novo usuário:", error);
                res.send("Ocorreu um erro ao inserir o novo usuário.");
                return;
              }
              console.log("Novo usuário registrado com sucesso:", results);
              res.redirect("/");
            }
          );
        }
      }
    );
  } else {
    res.send("Envie todas as credenciais!");
    res.end();
  }
});


app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});

function hash(string) {
  return createHash("sha256").update(string).digest("hex");
}
