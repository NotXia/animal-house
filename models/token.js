const mongoose = require("mongoose");

const tokenScheme = mongoose.Schema({
    username: { 
        type: String, 
        required: true 
    },
    token_hash: { 
        type: String, 
        required: true 
    },
    expiration: { 
        type: Date, 
        required: true,
        expires: 0 // In questo modo la data del campo expiration indica la validità
    }
});

module.exports = mongoose.model("tokens", tokenScheme);