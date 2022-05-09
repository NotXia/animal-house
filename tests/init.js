/**
 * Inizializza l'ambiente di test
 */

require("dotenv").config();
process.env.TESTING = true;
const mongoose = require("mongoose");

// Per nascondere i console.log
global.console = {
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
};

beforeAll(async function () {
    mongoose.connect(`${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE_NAME}`);
});

afterAll(async function () {
    mongoose.connection.close()
});
