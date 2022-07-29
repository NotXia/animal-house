require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');
const moment = require("moment");

let curr_session = session(app);

let operator1, operator2;
const TIME_FORMAT = "DD/MM/YYYY HH:mm";

beforeAll(async function () {
    operator1 = await utils.loginAsOperatorWithPermission(curr_session, { post_write: true, comment_write: true });
    operator2 = await utils.loginAsOperatorWithPermission(curr_session, { post_write: true, comment_write: true });
});


describe("Ricerca vuota", function () {
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


describe("Ricerca", function () {
    test("Ricerca corretta", async function () {
        const res = await curr_session.get(`/user/operators/${operator1.username}/absences/`).set({ Authorization: `Bearer ${operator1.token}` }).expect(200);
        expect(res.body.length).toEqual(2);
    });
});

describe("Cancellazione", function () {
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


describe("Uscita", function () {
    test("Pulizia", async function () {
        await utils.cleanup(curr_session);
    });
});