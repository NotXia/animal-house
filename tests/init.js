/**
 * Inizializza l'ambiente di test
 */

require("dotenv").config();
process.env.TESTING = true;

require("../db_init");
const db = require("../db");

beforeAll(async () => {
    await db.connect();
});

afterAll(async () => {
    db.client.close();
});