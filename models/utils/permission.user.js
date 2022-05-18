const mongoose = require("mongoose");

const permissionSchema = mongoose.Schema({
    user: { type: Boolean, default: true },
    vip: { type: Boolean, default: false },
    write_post: { type: Boolean, default: true },
    comment: { type: Boolean, default: true },
}, { _id: false });

module.exports = permissionSchema;