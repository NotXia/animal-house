require("dotenv").config();
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const OperatorModel = require("./models/auth/operator");


async function init() {
    await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE_NAME}`);

    await new OperatorModel({
        username: "admin",
        password: await bcrypt.hash("admin", parseInt(process.env.SALT_ROUNDS)),
        email: "admin@admin.it",
        name: "Admin",
        surname: "Admin",
        enabled: true,
        permission: { admin: true },
    }).save().catch((err) => { console.log(err.message); });

    await mongoose.connection.close();
};


module.exports = init;

if (!process.env.TESTING) {
    init();
}