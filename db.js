const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

module.exports.connect = async function () {
    console.log(`Connecting to MongoDB at ${process.env.MONGODB_URL}`);
    const client = await MongoClient.connect(process.env.MONGODB_URL)
                                    .catch((err) => { throw err });
    if (!client) { return null; }

    console.log(`Connecting to database ${process.env.MONGODB_DATABASE_NAME}`);
    let dbo = client.db(process.env.MONGODB_DATABASE_NAME);
    module.exports.dbo = dbo; // Per permettere di accedere alla connessione tramite il modulo

    // Creazione delle collezioni (se mancanti)
    await dbo.createCollection("users").catch((err) => {
        if (err.codeName !== "NamespaceExists") { throw err; }
    });

    console.log("Connected");
}