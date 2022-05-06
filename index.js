const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = require("./db");


app.use('/', express.static('public'));

// Crea la connessione al database prima di avviare il server
db.connect().then(() => {
    app.listen(process.env.NODE_PORT, () => {
        console.log(`Server started at http://localhost:${process.env.NODE_PORT}`);
    });
});
