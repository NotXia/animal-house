require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');
const moment = require("moment");
const UserModel = require("../models/auth/user");
const BookingModel = require("../models/services/booking");

let curr_session = session(app);

let operator1, operator2, operator3;
const TIME_FORMAT = "DD/MM/YYYY HH:mm";

beforeAll(async function () {
    operator1 = await utils.loginAsOperatorWithPermission(curr_session, []);
    operator2 = await utils.loginAsOperatorWithPermission(curr_session, []);
    operator3 = await utils.loginAsOperatorWithPermission(curr_session, []);
});


describe("Ricerca vuota di assenze", function () {
    test("Ricerca corretta", async function () {
        const res = await curr_session.get(`/user/operators/${operator1.username}/absences/`).set({ Authorization: `Bearer ${operator1.token}` }).expect(200);
        expect(res.body.length).toEqual(0);
    });

    test("Ricerca senza permessi di proprietà", async function () {
        await curr_session.get(`/user/operators/${operator1.username}/absences/`).set({ Authorization: `Bearer ${operator2.token}` }).expect(403);
    });
});


describe("Inserimento di assenze", function () {
    test("Inserimento corretto (1)", async function () {
        const start_vacation = moment("29/07/2022 9:00", TIME_FORMAT);
        const end_vacation = moment("29/07/2022 12:00", TIME_FORMAT)

        const res = await curr_session.post(`/user/operators/${operator1.username}/absences/`)
            .set({ Authorization: `Bearer ${operator1.token}` })
            .send({ absence_time: { start: start_vacation, end: end_vacation } }).expect(201);
        expect(moment(res.body[0].start).local().toISOString()).toEqual(start_vacation.toISOString());
        expect(moment(res.body[0].end).local().toISOString()).toEqual(end_vacation.toISOString());
    });

    test("Inserimento corretto (2)", async function () {
        const start_vacation = moment("14/08/2022 0:00", TIME_FORMAT);
        const end_vacation = moment("20/08/2022 23:59", TIME_FORMAT)

        const res = await curr_session.post(`/user/operators/${operator1.username}/absences/`)
            .set({ Authorization: `Bearer ${operator1.token}` })
            .send({ absence_time: { start: start_vacation, end: end_vacation } }).expect(201);
        expect(res.body[1].start).toEqual(start_vacation.local().format());
        expect(res.body[1].end).toEqual(end_vacation.local().format());
    });

    test("Inserimento errato - inizio dopo fine", async function () {
        const start_vacation = moment("29/07/2022 10:30", TIME_FORMAT);
        const end_vacation = moment("29/07/2022 10:29", TIME_FORMAT)

        await curr_session.post(`/user/operators/${operator1.username}/absences/`)
            .set({ Authorization: `Bearer ${operator1.token}` })
            .send({ absence_time: { start: start_vacation, end: end_vacation } }).expect(400);
    });
});


describe("Ricerca di assenze", function () {
    test("Ricerca corretta", async function () {
        const res = await curr_session.get(`/user/operators/${operator1.username}/absences/`).set({ Authorization: `Bearer ${operator1.token}` }).expect(200);
        expect(res.body.length).toEqual(2);
    });
});

describe("Cancellazione assenza", function () {
    test("Cancellazione corretta", async function () {
        await curr_session.delete(`/user/operators/${operator1.username}/absences/0`)
            .set({ Authorization: `Bearer ${operator1.token}` }).expect(204);
        
        const res = await curr_session.get(`/user/operators/${operator1.username}/absences/`).set({ Authorization: `Bearer ${operator1.token}` }).expect(200);
        expect(res.body.length).toEqual(1);
    });

    test("Cancellazione errata - Indice inesistente", async function () {
        await curr_session.delete(`/user/operators/${operator1.username}/absences/100`)
            .set({ Authorization: `Bearer ${operator1.token}` }).expect(404);

        const res = await curr_session.get(`/user/operators/${operator1.username}/absences/`).set({ Authorization: `Bearer ${operator1.token}` }).expect(200);
        expect(res.body.length).toEqual(1);
    });
});


describe("Inserimento/Aggiornamento orario lavorativo", function () {
    test("Aggiornamento corretto - Orario vuoto", async function () {
        const res = await curr_session.put(`/user/operators/${operator2.username}/working-time/`)
            .set({ Authorization: `Bearer ${operator2.token}` })
            .send({
                working_time: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
            }).expect(200);
        
        const user = await UserModel.findOne({ username: operator2.username }).exec();
        const operator_data = await user.findType();
        expect(await operator_data.getWorkingTimeData()).toEqual(res.body);
    });

    test("Aggiornamento corretto", async function () {
        const res = await curr_session.put(`/user/operators/${operator2.username}/working-time/`)
            .set({ Authorization: `Bearer ${operator2.token}` })
            .send({
                working_time: { 
                    monday: [{
                        time: { start: moment("9:00", "HH:mm").format(), end: moment("13:00", "HH:mm").format() },  hub: "MXP1"
                    }], 
                    tuesday: [
                        {
                            time: { start: moment("9:00", "HH:mm").format(), end: moment("13:00", "HH:mm").format() }, hub: "MXP1"
                        },
                        {
                            time: { start: moment("14:00", "HH:mm").format(), end: moment("17:00", "HH:mm").format() }, hub: "MXP1"
                        }
                    ], 
                    wednesday: [{
                        time: { start: moment("9:00", "HH:mm").format(), end: moment("9:10", "HH:mm").format() }, hub: "MXP1"
                    }], thursday: [], friday: [], saturday: [], sunday: [] }
            }).expect(200);

        const user = await UserModel.findOne({ username: operator2.username }).exec();
        const operator_data = await user.findType();
        expect(await operator_data.getWorkingTimeData()).toEqual(res.body);
    });

    test("Aggiornamento vuoto", async function () {
        const res = await curr_session.put(`/user/operators/${operator2.username}/working-time/`)
            .set({ Authorization: `Bearer ${operator2.token}` })
            .send({}).expect(200);
        
        const user = await UserModel.findOne({ username: operator2.username }).exec();
        const operator_data = await user.findType();
        expect(await operator_data.getWorkingTimeData()).toEqual(res.body);
    });

    test("Aggiornamento errato - Campo malformato (1)", async function () {
        await curr_session.put(`/user/operators/${operator2.username}/working-time/`)
            .set({ Authorization: `Bearer ${operator2.token}` })
            .send({
                working_time: { 
                    monday: [{ time: { start: moment("9:00", "HH:mm").format(), end: moment("13:00", "HH:mm").format() },  hub: "MXP1" }]
                }
            }).expect(400);
    });

    test("Aggiornamento errato - Campo malformato (2)", async function () {
        await curr_session.put(`/user/operators/${operator2.username}/working-time/`)
            .set({ Authorization: `Bearer ${operator2.token}` })
            .send({
                working_time: { 
                    lunedi: []
                }
            }).expect(400);
    });

    test("Aggiornamento errato - Orario inconsistente", async function () {
        await curr_session.put(`/user/operators/${operator2.username}/working-time/`)
            .set({ Authorization: `Bearer ${operator2.token}` })
            .send({
                working_time: { 
                    monday: [{
                        time: { start: moment("9:00", "HH:mm").format(), end: moment("8:00", "HH:mm").format() },  hub: "MXP1"
                    }], 
                    tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] 
                }
            }).expect(400);
    });
});

describe("Ricerca orario lavorativo", function () {
    test("Ricerca corretta", async function () {
        const res = await curr_session.get(`/user/operators/${operator2.username}/working-time/`)
            .set({ Authorization: `Bearer ${operator2.token}` }).expect(200);
        
        const user = await UserModel.findOne({ username: operator2.username }).exec();
        const operator_data = await user.findType();
        expect(await operator_data.getWorkingTimeData()).toEqual(res.body);
    });
});


describe("Ricerca disponibilità operatore", function () {
    let to_delete_appointments = [];
    
    test("Inserimento orario", async function () {
        await curr_session.put(`/user/operators/${operator3.username}/working-time/`)
            .set({ Authorization: `Bearer ${operator3.token}` })
            .send({
                working_time: { 
                    monday: [{ time: {start: moment("9:00", "HH:mm"), end: moment("13:00", "HH:mm")}, hub: "MXP1" }, { time: {start: moment("14:00", "HH:mm"), end: moment("17:00", "HH:mm")}, hub: "MXP1" }], 
                    tuesday: [],
                    wednesday: [{ time: {start: moment("14:00", "HH:mm"), end: moment("17:00", "HH:mm")}, hub: "MXP2" }],
                    thursday: [], 
                    friday: [], 
                    saturday: [], 
                    sunday: [] 
                }
            }).expect(200);
    });

    test("Ricerca disponibilità", async function () {
        let res = await curr_session.get(`/user/operators/${operator3.username}/availabilities/`).
            query({ start_date: moment("08/08/2022", "DD/MM/YYYY").format(), end_date: moment("11/08/2022", "DD/MM/YYYY").format() }).expect(200);
        expect(res.body[0].time.start).toEqual(moment("08/08/2022 9:00", TIME_FORMAT).local().format());
        expect(res.body[0].time.end).toEqual(moment("08/08/2022 13:00", TIME_FORMAT).local().format());
        expect(res.body[0].hub).toEqual("MXP1");
        expect(res.body[1].time.start).toEqual(moment("08/08/2022 14:00", TIME_FORMAT).local().format());
        expect(res.body[1].time.end).toEqual(moment("08/08/2022 17:00", TIME_FORMAT).local().format());
        expect(res.body[1].hub).toEqual("MXP1");
        expect(res.body[2].time.start).toEqual(moment("10/08/2022 14:00", TIME_FORMAT).local().format());
        expect(res.body[2].time.end).toEqual(moment("10/08/2022 17:00", TIME_FORMAT).local().format());
        expect(res.body[2].hub).toEqual("MXP2");
    });

    test("Inserimento assenza", async function () {
        await curr_session.post(`/user/operators/${operator3.username}/absences/`)
            .set({ Authorization: `Bearer ${operator3.token}` })
            .send({ absence_time: { start: moment("08/08/2022 8:00", TIME_FORMAT), end: moment("08/08/2022 10:00", TIME_FORMAT) } }).expect(201);
    });

    test("Ricerca disponibilità", async function () {
        let res = await curr_session.get(`/user/operators/${operator3.username}/availabilities/`).
            query({ start_date: moment("08/08/2022", "DD/MM/YYYY").format(), end_date: moment("11/08/2022", "DD/MM/YYYY").format() }).expect(200);
        expect(res.body[0].time.start).toEqual(moment("08/08/2022 10:00", TIME_FORMAT).local().format());
        expect(res.body[0].time.end).toEqual(moment("08/08/2022 13:00", TIME_FORMAT).local().format());
        expect(res.body[0].hub).toEqual("MXP1");
        expect(res.body[1].time.start).toEqual(moment("08/08/2022 14:00", TIME_FORMAT).local().format());
        expect(res.body[1].time.end).toEqual(moment("08/08/2022 17:00", TIME_FORMAT).local().format());
        expect(res.body[1].hub).toEqual("MXP1");
        expect(res.body[2].time.start).toEqual(moment("10/08/2022 14:00", TIME_FORMAT).local().format());
        expect(res.body[2].time.end).toEqual(moment("10/08/2022 17:00", TIME_FORMAT).local().format());
        expect(res.body[2].hub).toEqual("MXP2");
    });

    test("Inserimento appuntamento", async function () {
        to_delete_appointments.push( await new BookingModel({
            time_slot: {
                start: moment("08/08/2022 12:30", TIME_FORMAT).format(),
                end: moment("08/08/2022 13:00", TIME_FORMAT).format()
            },
            service_id: "111111111111111111111111",
            customer: "BestCustomerEver2022",
            animal_id: "111111111111111111111111",
            operator: operator3.username,
            hub: "MXP1"
        }).save() );

        to_delete_appointments.push( await new BookingModel({
            time_slot: {
                start: moment("08/08/2032 12:30", TIME_FORMAT).format(),
                end: moment("08/08/2032 13:00", TIME_FORMAT).format()
            },
            service_id: "111111111111111111111111",
            customer: "BestCustomerEver2022",
            animal_id: "111111111111111111111111",
            operator: operator3.username,
            hub: "MXP1"
        }).save() );
    });

    test("Ricerca disponibilità", async function () {
        let res = await curr_session.get(`/user/operators/${operator3.username}/availabilities/`).
            query({ start_date: moment("08/08/2022", "DD/MM/YYYY").format(), end_date: moment("11/08/2022", "DD/MM/YYYY").format() }).expect(200);
        expect(res.body[0].time.start).toEqual(moment("08/08/2022 10:00", TIME_FORMAT).local().format());
        expect(res.body[0].time.end).toEqual(moment("08/08/2022 12:30", TIME_FORMAT).local().format());
        expect(res.body[0].hub).toEqual("MXP1");
        expect(res.body[1].time.start).toEqual(moment("08/08/2022 14:00", TIME_FORMAT).local().format());
        expect(res.body[1].time.end).toEqual(moment("08/08/2022 17:00", TIME_FORMAT).local().format());
        expect(res.body[1].hub).toEqual("MXP1");
        expect(res.body[2].time.start).toEqual(moment("10/08/2022 14:00", TIME_FORMAT).local().format());
        expect(res.body[2].time.end).toEqual(moment("10/08/2022 17:00", TIME_FORMAT).local().format());
        expect(res.body[2].hub).toEqual("MXP2");
    });

    test("Inserimento assenza", async function () {
        await curr_session.post(`/user/operators/${operator3.username}/absences/`)
            .set({ Authorization: `Bearer ${operator3.token}` })
            .send({ absence_time: { start: moment("08/08/2022 14:00", TIME_FORMAT), end: moment("08/08/2022 17:00", TIME_FORMAT) } }).expect(201);
    });

    test("Ricerca disponibilità", async function () {
        let res = await curr_session.get(`/user/operators/${operator3.username}/availabilities/`).
            query({ start_date: moment("08/08/2022", "DD/MM/YYYY").format(), end_date: moment("11/08/2022", "DD/MM/YYYY").format() }).expect(200);
        expect(res.body[0].time.start).toEqual(moment("08/08/2022 10:00", TIME_FORMAT).local().format());
        expect(res.body[0].time.end).toEqual(moment("08/08/2022 12:30", TIME_FORMAT).local().format());
        expect(res.body[0].hub).toEqual("MXP1");
        expect(res.body[1].time.start).toEqual(moment("10/08/2022 14:00", TIME_FORMAT).local().format());
        expect(res.body[1].time.end).toEqual(moment("10/08/2022 17:00", TIME_FORMAT).local().format());
        expect(res.body[1].hub).toEqual("MXP2");
    });

    test("Ricerca disponibilità - Filtro per hub", async function () {
        let res = await curr_session.get(`/user/operators/${operator3.username}/availabilities/`).
            query({ start_date: moment("08/08/2022", "DD/MM/YYYY").format(), end_date: moment("11/08/2022", "DD/MM/YYYY").format(), hub: "MXP1" }).expect(200);
        expect(res.body[0].time.start).toEqual(moment("08/08/2022 10:00", TIME_FORMAT).local().format());
        expect(res.body[0].time.end).toEqual(moment("08/08/2022 12:30", TIME_FORMAT).local().format());
        expect(res.body[0].hub).toEqual("MXP1");
        expect(res.body.length).toEqual(1);
    });

    test("Ricerca disponibilità - Divisione in slot temporali (1)", async function () {
        let res = await curr_session.get(`/user/operators/${operator3.username}/availabilities/`).
            query({ start_date: moment("08/08/2022", "DD/MM/YYYY").format(), end_date: moment("11/08/2022", "DD/MM/YYYY").format(), hub: "MXP1", slot_size: 30 }).expect(200);
        expect(res.body.length).toEqual(5);
        expect(res.body[0].time.start).toEqual(moment("08/08/2022 10:00", TIME_FORMAT).local().format());
        expect(res.body[1].time.start).toEqual(moment("08/08/2022 10:30", TIME_FORMAT).local().format());
        expect(res.body[2].time.start).toEqual(moment("08/08/2022 11:00", TIME_FORMAT).local().format());
        expect(res.body[3].time.start).toEqual(moment("08/08/2022 11:30", TIME_FORMAT).local().format());
        expect(res.body[4].time.start).toEqual(moment("08/08/2022 12:00", TIME_FORMAT).local().format());
    });

    test("Ricerca disponibilità - Divisione in slot temporali (2)", async function () {
        let res = await curr_session.get(`/user/operators/${operator3.username}/availabilities/`).
            query({ start_date: moment("08/08/2022", "DD/MM/YYYY").format(), end_date: moment("11/08/2022", "DD/MM/YYYY").format(), hub: "MXP1", slot_size: 60 }).expect(200);
        expect(res.body.length).toEqual(2);
        expect(res.body[0].time.start).toEqual(moment("08/08/2022 10:00", TIME_FORMAT).local().format());
        expect(res.body[1].time.start).toEqual(moment("08/08/2022 11:00", TIME_FORMAT).local().format());
    });

    test("Ricerca disponibilità - Divisione in slot temporali (3)", async function () {
        let res = await curr_session.get(`/user/operators/${operator3.username}/availabilities/`).
            query({ start_date: moment("08/08/2022", "DD/MM/YYYY").format(), end_date: moment("11/08/2022", "DD/MM/YYYY").format(), hub: "MXP1", slot_size: 10000 }).expect(200);
        expect(res.body.length).toEqual(0);
    });

    test("Pulizia", async function () {
        for (const appointment of to_delete_appointments) {
            await BookingModel.findByIdAndDelete(appointment._id);
        }
    });
});


describe("Uscita", function () {
    test("Pulizia", async function () {
        await utils.cleanup(curr_session);
    });
});