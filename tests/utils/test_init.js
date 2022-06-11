const mongoose = require("mongoose");

// Per nascondere i console.log
const empty_function = () => { };
global.console.log = empty_function;

beforeAll(async function () {
    await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE_NAME}`);
});

afterAll(async function () {
    await mongoose.connection.close();
});
