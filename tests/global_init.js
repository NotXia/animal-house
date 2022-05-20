/**
 * Inizializza l'ambiente di test
 */

require("dotenv").config();
process.env.TESTING = true;
process.env.MONGODB_DATABASE_NAME = process.env.MONGODB_DATABASE_NAME + "_test";
process.env.TEMP_DIR = __dirname + "/tmp"
process.env.SHOP_IMAGES_DIR_ABS_PATH = process.env.TEMP_DIR

const path = require("path");
const fs = require("fs");

const db_init = require("../db_init");

module.exports = async function () {
    // Per nascondere i console.log
    const empty_function = () => { };
    global.console.log = empty_function;

    await db_init();
    
    if (fs.existsSync(process.env.TEMP_DIR)) {
        fs.rmSync(process.env.TEMP_DIR, { recursive: true });
    }
    fs.mkdirSync(process.env.TEMP_DIR);
}
