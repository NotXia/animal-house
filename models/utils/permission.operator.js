const mongoose = require("mongoose");

const permissionSchema = mongoose.Schema({
    operator: { type: Boolean, default: true },
    admin: { type: Boolean, default: false },
    
    shop_read: { type: Boolean, default: false },
    shop_write: { type: Boolean, default: false },
}, { _id: false });

module.exports = permissionSchema;