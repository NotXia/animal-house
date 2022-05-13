const mongoose = require("mongoose");

beforeAll(async function () {
    await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE_NAME}`);
});

afterAll(async function () {
    await mongoose.connection.close();
});
