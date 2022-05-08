const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

module.exports.connect = async function () {
    console.log(`Connecting to MongoDB at ${process.env.MONGODB_URL}`);
    const client = await MongoClient.connect(process.env.MONGODB_URL).catch((err) => { throw err });

    console.log(`Connecting to database ${process.env.MONGODB_DATABASE_NAME}`);
    let dbo = client.db(process.env.MONGODB_DATABASE_NAME);

    // Per permettere di accedere alla connessione tramite il modulo
    module.exports.client = client;
    module.exports.users = dbo.collection("users");
    module.exports.tokens = dbo.collection("tokens"); 

    console.log("Connected");
}