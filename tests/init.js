/**
 * Inizializza l'ambiente di test
 */

require("dotenv").config();
process.env.TESTING = true;

const db = require("../db");
const db_init = require("../db_init");

beforeAll(async function () {
    await db_init();
    await db.connect();
});

afterAll(async function () {
    db.client.close();
});
