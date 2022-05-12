const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const roleScheme = mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    services_id: [{ 
        type: ObjectId, ref: "services",  
        require: true 
    }]
});

module.exports = mongoose.model("roles", roleScheme);
