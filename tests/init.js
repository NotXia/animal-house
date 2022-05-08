/**
 * Inizializza l'ambiente di test
 */

require("dotenv").config();
process.env.TESTING = true;

const db = require("../db");

// Per nascondere i console.log
global.console = {
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
};

beforeAll(async function () {
    await db.connect();
});

afterAll(async function () {
    db.client.close();
});
