require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { middlewareErrorHandler } = require("./error_handler");

const auth = require("./routes/auth");
const user = require("./routes/user");
const shop = require("./routes/shop");
const blog = require("./routes/post");
const hub = require("./routes/hub");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/", express.static("public"));
app.use("/auth", auth);
app.use("/user", user);
app.use("/shop", shop);
app.use("/blog", blog);
app.use("/hub", hub);

app.use(middlewareErrorHandler);

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