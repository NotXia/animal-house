require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { middlewareErrorHandler } = require("./error_handler");
const fs = require("fs");

const auth = require("./routes/auth");
const file = require("./routes/file");
const user = require("./routes/user");
const shop = require("./routes/shop");
const blog = require("./routes/blog");
const hub = require("./routes/hub");
const service = require("./routes/service");
const species = require("./routes/species");
const animal = require("./routes/animal");
const booking = require("./routes/booking");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/", express.static("public"));
app.use("/auth", auth);
app.use("/files", file);
app.use("/user", user);
app.use("/shop", shop);
app.use("/blog", blog);
app.use("/hubs", hub);
app.use("/services", service);
app.use("/animals/species", species);
app.use("/animals", animal);
app.use("/appointments", booking);

app.use(middlewareErrorHandler);

// Creazione cartelle
for (const dir of [process.env.IMAGES_TMP_ABS_PATH, process.env.SHOP_IMAGES_DIR_ABS_PATH, process.env.BLOG_IMAGES_DIR_ABS_PATH, process.env.CUSTOMER_ANIMAL_IMAGES_DIR_ABS_PATH]) {
    if ( !fs.existsSync(dir) ){  fs.mkdirSync(dir, { recursive: true }); }
}

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