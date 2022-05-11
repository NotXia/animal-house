const mongoose = require("mongoose");

const userScheme = mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true,
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    name: { 
        type: String, 
        required: true 
    }, 
    surname: { 
        type: String, 
        required: true 
    },
    gender: { type: String },
    address: { 
        city: String,
        street: String,
        house_number: String,
        postal_code: String
    }, 
    phone: { type: String },
    enabled: { type: Boolean, default: false },
    creationDate: { type: Date, default: new Date() }
});

module.exports = mongoose.model("users", userScheme);