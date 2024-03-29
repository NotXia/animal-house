const mongoose = require("mongoose");

const permissionSchema = mongoose.Schema({
    user: { type: Boolean, default: true },
    vip: { type: Boolean, default: false },
    post_write: { type: Boolean, default: true },
    comment_write: { type: Boolean, default: true },
}, { _id: false });

module.exports = permissionSchema;