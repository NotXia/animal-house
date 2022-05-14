const mongoose = require("mongoose");

const permissionSchema = mongoose.Schema({
    admin: { type: Boolean, default: false },
}, { _id: false });

module.exports = permissionSchema;