const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const bcrypt = require("bcrypt");

async function createAdmin() {
    let username = "admin";
    let password = "admin";
    
    let password_hash = await bcrypt.hash(password, 10);
    
    return {
        username: username,
        password: password_hash,
    };
}

module.exports.connect = async function () {
    console.log(`Connecting to MongoDB at ${process.env.MONGODB_URL}`);
    const client = await MongoClient.connect(process.env.MONGODB_URL)
                                    .catch((err) => { throw err });

    console.log(`Connecting to database ${process.env.MONGODB_DATABASE_NAME}`);
    let dbo = client.db(process.env.MONGODB_DATABASE_NAME);
    module.exports.dbo = dbo; // Per permettere di accedere alla connessione tramite il modulo

    // Creazione delle collezioni (se mancanti)
    dbo.createCollection("users", async (err) => {
        if (err.codeName === "NamespaceExists") { return; }
        else if (err.codeName !== "NamespaceExists") { throw err; }

        await dbo.collection("users").createIndex({ "username": 1 }, { unique: true });
        await dbo.collection("users").insertOne(await createAdmin()).catch((err) => {
            if (err.code !== 11000) { throw err; } // Duplicato
        });
    });


    console.log("Connected");
}