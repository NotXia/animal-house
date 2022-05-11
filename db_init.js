require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const UserModel = require("./models/user");


async function init() {
    mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE_NAME}`);

    await new UserModel({
        username: "admin",
        password: await bcrypt.hash("admin", parseInt(process.env.SALT_ROUNDS)),
        email: "admin@admin.it",
        name: "Admin",
        surname: "Admin",
        enabled: true
    }).save().catch((err) => { console.log(err.message); });

    mongoose.connection.close()
};


module.exports = init;

if (!process.env.TESTING) {
    init();
}