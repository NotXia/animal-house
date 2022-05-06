const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const bcrypt = require("bcrypt");
const ms = require("ms");

async function createAdmin() {
    let username = "admin";
    let password = "admin";

    let password_hash = await bcrypt.hash(password, 10);

    return {
        username: username,
        password: password_hash,
    };
}

async function init() {
    const client = await MongoClient.connect(process.env.MONGODB_URL).catch((err) => { throw err });
    let dbo = client.db(process.env.MONGODB_DATABASE_NAME);

    dbo.createCollection("users", async function(err) {
        if (err) { throw err; }
    
        await dbo.collection("users").createIndex({ "username": 1 }, { unique: true });
        await dbo.collection("users").insertOne(await createAdmin()).catch((err) => { throw err; });
    });
    
    dbo.createCollection("tokens", async function(err) {
        if (err) { throw err; }

        await dbo.collection("tokens").createIndex({ "expiration": 1 }, { expireAfterSeconds: 0 }); // In questo modo la data del campo expiration indica la validità
    });
};

init();
process.exit()