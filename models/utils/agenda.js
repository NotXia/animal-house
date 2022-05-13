const mongoose = require("mongoose");

function getAgendaSchema(agenda_content) {
    return mongoose.Schema({
        monday: [agenda_content],
        tuesday: [agenda_content],
        wednesday: [agenda_content],
        thursday: [agenda_content],
        friday: [agenda_content],
        saturday: [agenda_content],
        sunday: [agenda_content]
    }, { _id: false });
}

module.exports = getAgendaSchema;