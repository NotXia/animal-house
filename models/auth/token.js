const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const UserModel = require("./user");

const tokenScheme = mongoose.Schema({
    user_id: { 
        type: ObjectId, ref: UserModel.collection.collectionName,
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