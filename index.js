const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const db = require("./db");

const auth = require("./routes/auth");


app.use("/", express.static("public"));
app.use("/auth", auth);


// Gestore degli errori
app.use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        res.sendStatus(401);
    } else {
        next(err);
    }
});

// Crea la connessione al database prima di avviare il server
db.connect().then(() => {
    app.listen(process.env.NODE_PORT, () => {
        console.log(`Server started at http://localhost:${process.env.NODE_PORT}`);
    });
});
