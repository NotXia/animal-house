const mongoose = require("mongoose");

const permissionSchema = mongoose.Schema({
    name: { type: String, unique: true, required: true },
    urls: [{ type: String }] // URL alla pagina di amministrazione associata al permesso
});

permissionSchema.methods.getData = function() {
    return {
        name: this.name,
        urls: this.urls
    }
};

module.exports = mongoose.model("permissions", permissionSchema);