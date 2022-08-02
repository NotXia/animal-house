const mongoose = require("mongoose");
const timeSlotSchema = require("../utils/timeSlotSchema");
const getAgendaSchema = require("../utils/agenda");
const Moment = require("moment");
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);
const { WEEKS } = require("../../utilities");
const BookingModel = require("../services/booking");

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

    services: [{ 
        type: String,  
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
        start: moment(time.start).local().format(),
        end: moment(time.end).local().format()
    };
}

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
        "operator": this.user.username, 
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
 * @returns Array di disponibilità [ {time: {start, end}, hub} ]
 */
operatorScheme.methods.getAvailabilityData = async function(start_date, end_date, hub, slot_size) {
    // Normalizzazione valori delle date
    start_date = moment(start_date).startOf("day");
    end_date = moment(end_date).endOf("day");

    let availabilities = [];
    let unavailable_slots = [];

    // Aggiorna gli slot disponibili con l'orario lavorativo standard
    for (let working_day of moment.range(start_date, end_date).by("days")) {
        for (const work_time of this.working_time[WEEKS[working_day.isoWeekday()-1]]) { // Individua la settimana corretta
            if (!hub || work_time.hub === hub) {
                // Imposta l'orario con la data corretta (quella della richiesta) 
                let start_time = moment(work_time.time.start).set({ date: working_day.date(), month: working_day.month(), year: working_day.year() });
                let end_time = moment(work_time.time.end).set({ date: working_day.date(), month: working_day.month(), year: working_day.year() });
            
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

    availabilities = availabilities.map((availability) => ({
        time: formatTimeSlot(availability.time),
        hub: availability.hub
    }));

    return availabilities;
}

module.exports = mongoose.model("operators", operatorScheme);