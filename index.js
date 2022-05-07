const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const db = require("./db");

const auth = require("./routes/auth");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/", express.static("public"));
app.use("/auth", auth);


/* Gestore degli errori */
app.use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError") { // Eccezione lanciata da express-jwt
        res.sendStatus(403);
    } else {
        next(err);
    }
});

// Crea la connessione al database prima di avviare il server
db.connect().then(function () {
    app.listen(process.env.NODE_PORT, function () {
        console.log(`Server started at http://localhost:${process.env.NODE_PORT}`);
    });
});
