require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');
const moment = require("moment");
const UserModel = require("../models/auth/user");

let curr_session = session(app);

let operator1, operator2;
const TIME_FORMAT = "DD/MM/YYYY HH:mm";

beforeAll(async function () {
    operator1 = await utils.loginAsOperatorWithPermission(curr_session, { post_write: true, comment_write: true });
    operator2 = await utils.loginAsOperatorWithPermission(curr_session, { post_write: true, comment_write: true });
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
        expect(moment(res.body[0].start).utcOffset('+0200').toISOString()).toEqual(start_vacation.toISOString());
        expect(moment(res.body[0].end).utcOffset('+0200').toISOString()).toEqual(end_vacation.toISOString());
    });

    test("Inserimento corretto (2)", async function () {
        const start_vacation = moment("14/08/2022 0:00", TIME_FORMAT);
        const end_vacation = moment("20/08/2022 23:59", TIME_FORMAT)

        const res = await curr_session.post(`/user/operators/${operator1.username}/absences/`)
            .set({ Authorization: `Bearer ${operator1.token}` })
            .send({ absence_time: { start: start_vacation, end: end_vacation } }).expect(201);
        expect(res.body[1].start).toEqual(start_vacation.utcOffset('+0200').format());
        expect(res.body[1].end).toEqual(end_vacation.utcOffset('+0200').format());
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
    test("Inserimento corretto - Orario vuoto", async function () {
        const res = await curr_session.put(`/user/operators/${operator2.username}/working-time/`)
            .set({ Authorization: `Bearer ${operator2.token}` })
            .send({
                working_time: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
            }).expect(200);
        
        const user = await UserModel.findOne({ username: operator2.username }).exec();
        const operator_data = await user.findType();
        expect(await operator_data.getWorkingTimeData()).toEqual(res.body);
    });

    test("Inserimento corretto", async function () {
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


describe("Uscita", function () {
    test("Pulizia", async function () {
        await utils.cleanup(curr_session);
    });
});