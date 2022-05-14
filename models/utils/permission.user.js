const mongoose = require("mongoose");

const permissionSchema = mongoose.Schema({
    vip: { type: Boolean, default: false },
    write_post: { type: Boolean, default: true },
    comment: { type: Boolean, default: true },
}, { _id: false });

module.exports = permissionSchema;