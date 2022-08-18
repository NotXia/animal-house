/**
 * Inizializza l'ambiente di test
 */

const path = require("path");
const fs = require("fs");

require("dotenv").config();
process.env.TESTING = true;
process.env.MONGODB_DATABASE_NAME = process.env.MONGODB_DATABASE_NAME + "_test";

const db_init = require("../../db_init");

module.exports = async function () {
    // Per nascondere i console.log
    const empty_function = () => { };
    global.console.log = empty_function;

    await db_init();
}
