/**
 * Inizializza l'ambiente di test
 */

require("dotenv").config();
process.env.TESTING = true;
process.env.MONGODB_DATABASE_NAME = process.env.MONGODB_DATABASE_NAME + "_test";

const db_init = require("../db_init");
const empty_function = () => {};

// Per nascondere i console.log
global.console = {
    log:        empty_function,
    debug:      empty_function,
    info:       empty_function,
    // warn:       empty_function,
    // error:      empty_function
};

module.exports = async function () {
    await db_init();
}
