const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const getAgendaSchema = require("../utils/agenda");
const Moment = require("moment");
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
const { WEEKS } = require("../../utilities");
const BookingModel = require("../services/booking");
const ServiceModel = require("../services/service");
const ObjectId = mongoose.Schema.Types.ObjectId;
const HubModel = require("../services/hub");

const workingSlot = mongoose.Schema({
    time: { 
        type: timeSlotSchema, 
        required: true 
    },
    hub: {
        type: String,
        match: /^[A-Z]{3}[1-9][0-9]*$/,
        required: true
    }
}, { _id: false });

const operatorScheme = mongoose.Schema({
    role: { type: String, default: "" },

    services_id: [{ 
        type: ObjectId, ref: ServiceModel.collection.collectionName
    }],

    working_time: {
        type: getAgendaSchema(workingSlot),
        required: true,
        default: {}
    },
    absence_time: [{
        type: timeSlotSchema
    }]
});

/**
 * Formatta uno slot orario nel fuso orario locale
 */
function formatTimeSlot(time) {
    return {
        start: moment.utc(time.start).format(),
        end: moment.utc(time.end).format()
    };
}

/**
 * Restituisce i dati sull'utenza
 */
operatorScheme.methods.getUserData = async function() {
    const UserModel = require("./user");

    if (!this.user) {
        const user = await UserModel.findOne({ type_name: "operator", type_id: this._id }).exec();
        this.user = user; // Caching della query
    }

    return this.user;
};

/**
 * Restituisce i dati sulle assenze
 */
operatorScheme.methods.getAbsenceTimeData = function() {
    return this.absence_time.map((absence) => formatTimeSlot(absence));
};

/**
 * Restituisce i dati sull'orario lavorativo standard
 */
operatorScheme.methods.getWorkingTimeData = function() {
    let out = {};

    for (let week of WEEKS) {
        out[week] = this.working_time[week].map(function (work_time) {
            return {
                time: formatTimeSlot(work_time.time),
                hub: work_time.hub
            };
        });
    }

    return out;
};

/**
 * Restituisce le assenze dell'operatore come intervalli di tempo
 * @param {Date} start_date     Data di inizio ricerca
 * @param {Date} end_date       Data di fine ricerca
 */
operatorScheme.methods.getAbsenceTimeSlots = function (start_date, end_date) {
    let absence_slots = [];
    const query_interval = moment.range(start_date, end_date);

    for (const absence of this.absence_time) {
        let absence_interval = moment.range(absence.start, absence.end);

        // Considera solo le assenze che effettivamente servono
        if (absence_interval.overlaps(query_interval, { adjacent: true })) { 
            absence_slots.push(absence_interval); 
        }
    }

    return absence_slots;
}

/**
 * Restituisce gli appuntamenti dell'operatore come intervalli di tempo
 * @param {Date} start_date     Data di inizio ricerca
 * @param {Date} end_date       Data di fine ricerca
 */
operatorScheme.methods.getAppointmentTimeSlots = async function (start_date, end_date, hub) {
    let appointment_slots = []

    let query = { 
        "operator": (await this.getUserData()).username, 
        "time_slot.start": {"$gte": start_date}, 
        "time_slot.end": {"$lte": end_date}
    }
    if (hub) { query.hub = hub; }
    const appointments = await BookingModel.find(query, { "time_slot": 1 }).exec();

    for (const appointment of appointments) { 
        appointment_slots.push(moment.range(appointment.time_slot.start, appointment.time_slot.end)); 
    }

    return appointment_slots;
}

/**
 * Divide un array di moment-range in slot temporali di dimensione fissata.
 */
function createSlots(availabilities, slot_size) {
    let slots = [];

    for (const availability of availabilities) {
        const slots_start = Array.from(availability.time.by("minutes", { step: slot_size }));

        // Ricomposizione degli slot con inizio e fine
        for (let i=0; i<slots_start.length-1; i++) {
            slots.push({
                time: moment.range(slots_start[i], slots_start[i+1]),
                hub: availability.hub
            });
        }
    }

    return slots;
}

/**
 * Calcolo gli slot di tempo in cui l'operatore è disponibile
 * @param {Date} start_date     Data di inizio ricerca
 * @param {Date} end_date       Data di fine ricerca
 * @param {String} hub          Codice di uno specifico hub (facoltativo)
 * @param {Number} slot_size    Dimensione dello slot di tempo (facoltativo)
 * @returns Array di disponibilità [ {time: {start, end}, hub, username} ]
 */
operatorScheme.methods.getAvailabilityData = async function(start_date, end_date, hub, slot_size) {
    // Normalizzazione valori delle date
    start_date = moment.utc(moment.parseZone(start_date).format("YYYY-MM-DD"), "YYYY-MM-DD").startOf("day");
    if (start_date.isBefore(moment())) { start_date = moment.utc(); } // Per evitare prenotazioni al passato
    end_date = moment.utc(moment.parseZone(end_date).format("YYYY-MM-DD"), "YYYY-MM-DD").endOf("day");

    let availabilities = [];
    let unavailable_slots = [];

    // Aggiorna gli slot disponibili con l'orario lavorativo standard
    for (let working_day of moment.range(start_date, end_date).by("days")) {
        for (const work_time of this.working_time[WEEKS[working_day.isoWeekday()-1]]) { // Individua la settimana corretta
            if (!hub || work_time.hub === hub) {
                // Imposta l'orario con la data corretta (quella della richiesta) 
                let start_time = moment.utc(work_time.time.start).set({ date: working_day.date(), month: working_day.month(), year: working_day.year() });
                let end_time = moment.utc(work_time.time.end).set({ date: working_day.date(), month: working_day.month(), year: working_day.year() });
            
                availabilities.push({
                    time: moment.range(start_time, end_time),
                    hub: work_time.hub
                });
            }
        }
    }

    // Aggiorna gli slot indisponibili con le assenze
    unavailable_slots = unavailable_slots.concat(this.getAbsenceTimeSlots(start_date, end_date));
    // Aggiorna gli slot indisponibili con gli appuntamenti già fissati
    unavailable_slots = unavailable_slots.concat(await this.getAppointmentTimeSlots(start_date, end_date, hub));

    // Calcolo degli slot disponibili
    for (const absence of unavailable_slots) { 
        let absence_interval = moment.range(absence.start, absence.end);
        let new_availabilities = [];

        for (const availability of availabilities) {
            const new_intervals = (availability.time).subtract(absence_interval);

            for (const interval of new_intervals) { new_availabilities.push({ time: interval, hub: availability.hub }); } 
        }

        availabilities = new_availabilities;
    }

    // Divisione in slot temporali
    if (slot_size) { availabilities = createSlots(availabilities, slot_size); }

    availabilities = await Promise.all(
        availabilities.map(async (availability) => ({
            time: formatTimeSlot(availability.time),
            hub: availability.hub,
            operator_username: (await this.getUserData()).username
        })) 
    );

    if (slot_size) {
        // Rimuove le disponibilità passate o troppo vicine a ora
        availabilities = availabilities.filter((availability) => moment(availability.time.start).isAfter(moment().add(2, "hours")));

        // Rimuove le disponibilità se l'hub è chiuso
        let hubs = {};
        for (const availability of availabilities) {
            if (!hubs[availability.hub]) { hubs[availability.hub] = await HubModel.findOne({ code: availability.hub }); }
        }
        availabilities = availabilities.filter((availability) => hubs[availability.hub].isOpen(availability.time.start, availability.time.end));
    }
    return availabilities;
}

/**
 * Indica se l'operatore è disponibile in una determinata fascia oraria
 * @param {Date} start_date     Data e ora di inizio ricerca
 * @param {Date} end_date       Data e ora di fine ricerca
 * @param {String} hub          Codice di uno specifico hub (facoltativo)
 * @returns true se disponibile, false altrimenti
 */
operatorScheme.methods.isAvailableAt = async function(start_date, end_date, hub) {
    const availabilities = await this.getAvailabilityData(moment.utc(start_date), moment.utc(end_date), hub);
    const query_interval = moment.range(moment.utc(start_date), moment.utc(end_date));

    for (const availability of availabilities) {
        if (moment.range(moment.utc(availability.time.start), moment.utc(availability.time.end)).contains(query_interval)) { 
            return true; 
        }
    }

    return false;
}

module.exports = mongoose.model("operators", operatorScheme);