const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
require("dotenv").config();

const mongoose = require("mongoose");

const auth = require("./routes/auth");

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

if (!process.env.TESTING) {
    // Crea la connessione al database prima di avviare il server
    mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE_NAME}`).then(function () {
        app.listen(process.env.NODE_PORT, function () {
            console.log(`Server started at http://localhost:${process.env.NODE_PORT}`);
        });
    })

}
else {
    module.exports = app;
}