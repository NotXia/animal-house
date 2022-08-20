/*
    Fallback nel caso le variabili d'ambiente in .env non vengano importate
*/
require("dotenv").config();
const fs = require("fs");
const path = require("path");

if (!process.env.ENVIRONMENT_LOADED) {
    const lines = fs.readFileSync(path.join(__dirname, ".env"), "utf-8").split("\n").filter(Boolean);
    
    for (const env of lines) {
        let variable = env.split("=");

        const name = variable[0].trim();
        const value = variable[1].trim().replaceAll('"', "").replaceAll("'", "");

        process.env[name] = value;
    }
}