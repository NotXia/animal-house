require("dotenv").config();
require("./.env.js")
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { middlewareErrorHandler } = require("./error_handler");
const fs = require("fs");
const path = require("path");
const db_init = require("./db_init");
const cors = require('cors');

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
const game = require("./routes/game");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/auth", auth);
app.use("/files", file);
app.use("/users", user);
app.use("/shop", shop);
app.use("/blog", blog);
app.use("/hubs", hub);
app.use("/services", service);
app.use("/animals/species", species);
app.use("/animals", animal);
app.use("/appointments", booking);
app.use("/games", game);

app.use(middlewareErrorHandler);

app.use("/", express.static("public"));
app.use("/admin", express.static("frontend/backoffice"));

app.use("/fo", express.static("frontend/frontoffice/build"));
app.use("/fo/*", (req, res) => { res.sendFile(path.join(__dirname, "frontend/frontoffice/build/index.html")) });

app.use("/", express.static("frontend/game/dist"));
app.use((req, res) => { res.sendFile(path.join(__dirname, "frontend/game/dist/index.html")) });

async function start() {
    await db_init();

    // Crea la connessione al database prima di avviare il server
    if (process.env.PROTECTED_DB) { await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE_NAME}?authSource=admin`); }
    else { await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE_NAME}`); }
    
    app.listen(process.env.NODE_PORT, function () {
        console.log(`Server started at http://localhost:${process.env.NODE_PORT}`);
    });
}

// Creazione cartelle
for (const dir of [process.env.IMAGES_TMP_ABS_PATH, process.env.SHOP_IMAGES_DIR_ABS_PATH, process.env.BLOG_IMAGES_DIR_ABS_PATH, process.env.CUSTOMER_ANIMAL_IMAGES_DIR_ABS_PATH, process.env.PROFILE_PICTURE_IMAGES_DIR_ABS_PATH]) {
    if ( !fs.existsSync(dir) ){  fs.mkdirSync(dir, { recursive: true }); }
}

if (!process.env.TESTING) {
    start();
}
else {
    module.exports = app;
}
