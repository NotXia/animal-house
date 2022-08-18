require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');
const moment = require("moment");

const HubModel = require("../models/services/hub");

let curr_session = session(app);

let admin_token;
const service1 = "111111111111111111111111";
const service2 = "111111111111111111111112";
const service3 = "111111111111111111111113";

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);

    const operator1 = await utils.loginAsOperatorWithPermission(curr_session, [], [ service1, service2 ]);
    await curr_session.put(`/users/operators/${operator1.username}/working-time`)
    .send({ working_time: { 
        monday: [{ time: {start: moment("9:00", "HH:mm"), end: moment("13:00", "HH:mm")}, hub: "BLQ1" }], 
        tuesday: [], wednesday: [], thursday: [],  friday: [],  saturday: [],  sunday: [] 
    } }).set({ Authorization: `Bearer ${admin_token}` });

    const operator2 = await utils.loginAsOperatorWithPermission(curr_session, [], [ service2 ]);
    await curr_session.put(`/users/operators/${operator2.username}/working-time`)
    .send({ working_time: { 
        monday: [{ time: {start: moment("9:00", "HH:mm"), end: moment("13:00", "HH:mm")}, hub: "BLQ2" }], 
        tuesday: [], wednesday: [], thursday: [],  friday: [],  saturday: [],  sunday: [] 
    } }).set({ Authorization: `Bearer ${admin_token}` });

    const operator3 = await utils.loginAsOperatorWithPermission(curr_session, [], [ service3 ]);
    await curr_session.put(`/users/operators/${operator3.username}/working-time`)
    .send({ working_time: { 
        monday: [{ time: {start: moment("9:00", "HH:mm"), end: moment("13:00", "HH:mm")}, hub: "BLQ2" }], 
        tuesday: [], wednesday: [], thursday: [],  friday: [],  saturday: [],  sunday: [] 
    } }).set({ Authorization: `Bearer ${admin_token}` });
});

describe("Creazione di hub", function () {
    test("Creazione corretta", async function () {
        await curr_session.post('/hubs/').send({
            code: "BLQ1",
            name: "Animali carini e coccolosi di S.G. Srl",
            address: {
                city: "Bologna",
                street: "Via delle prove",
                number: "15/B",
                postal_code: "40100"
            },
            position: {
                type: "Point", coordinates: [44.499192, 11.327076] // Porta San Felice
            },
            opening_time: { 
                monday: [{ start: moment("9:00", "HH:mm").format(), end: moment("19:00", "HH:mm").format() }],
                tuesday: [{ start: moment("9:00", "HH:mm").format(), end: moment("19:00", "HH:mm").format() }],
                wednesday: [{ start: moment("9:00", "HH:mm").format(), end: moment("19:00", "HH:mm").format() }],
                thursday: [{ start: moment("9:00", "HH:mm").format(), end: moment("19:00", "HH:mm").format() }],
                friday: [{ start: moment("9:00", "HH:mm").format(), end: moment("19:00", "HH:mm").format() }],
                saturday: [
                    { start: moment("10:00", "HH:mm").format(), end: moment("13:00", "HH:mm").format() },
                    { start: moment("15:00", "HH:mm").format(), end: moment("17:00", "HH:mm").format() }
                ],
                sunday: [
                    { start: moment("10:00", "HH:mm").format(), end: moment("13:00", "HH:mm").format() },
                    { start: moment("15:00", "HH:mm").format(), end: moment("17:00", "HH:mm").format() }
                ]
            },
            phone: "051000000",
            email: "animalicarini@coccolosi.it"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);

        const hub = await HubModel.findOne({ code: "BLQ1" }).exec();
        expect(hub).toBeDefined();
        expect(hub.code).toEqual("BLQ1");
        expect(moment(hub.opening_time.monday[0].start).local().format()).toEqual(moment("9:00", "HH:mm").local().format());
        expect(hub.position.coordinates[0]).toEqual(44.499192);
        expect(hub.position.coordinates[1]).toEqual(11.327076);
    });

    test("Creazione corretta", async function () {
        await curr_session.post('/hubs/').send({
            code: "BLQ2",
            name: "Ancora Animali Srl",
            address: {
                city: "Bologna",
                street: "Via dei testing",
                number: "350/A",
                postal_code: "40100"
            },
            position: {
                type: "Point", coordinates: [44.484245, 11.356587] // Porta Santo Stefano
            },
            opening_time: { 
                monday: [{ start: moment("04:00", "HH:mm").format(), end: moment("23:00", "HH:mm").format() }],
                tuesday: [{ start: moment("04:00", "HH:mm").format(), end: moment("23:00", "HH:mm").format() }],
                wednesday: [{ start: moment("04:00", "HH:mm").format(), end: moment("23:00", "HH:mm").format() }],
                thursday: [{ start: moment("04:00", "HH:mm").format(), end: moment("23:00", "HH:mm").format() }],
                friday: [{ start: moment("04:00", "HH:mm").format(), end: moment("23:00", "HH:mm").format() }],
                saturday: [],
                sunday: []
            },
            phone: "051000000",
            email: "ancoraanimali@gmail.com"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);

        const hub = await HubModel.findOne({ code: "BLQ2" }).exec();
        expect(hub).toBeDefined();
        expect(hub.code).toEqual("BLQ2");
        expect(moment(hub.opening_time.monday[0].start).local().format()).toEqual(moment("4:00", "HH:mm").local().format());
    });

    test("Creazione errata - Codice malformato", async function () {
        await curr_session.post('/hubs/').send({
            code: "KFC",
            name: "Animali nella capitale",
            address: {
                city: "Roma",
                street: "Via della capitale",
                number: "69/X",
                postal_code: "00042"
            },
            position: {
                type: "Point", coordinates: [0.0, 0.0]
            },
            opening_time: { 
                monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
            },
            phone: "010000000",
            email: "animalicapitale@romacapitale.it"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);
    });

    test("Creazione errata - Intervallo di tempo invalido", async function () {
        await curr_session.post('/hubs/').send({
            code: "FCO1",
            name: "Animali nella capitale",
            address: {
                city: "Roma",
                street: "Via della capitale",
                number: "69/X",
                postal_code: "00042"
            },
            position: {
                type: "Point", coordinates: [0.0, 0.0]
            },
            opening_time: { 
                monday: [{ start: moment("10:00", "HH:mm").format(), end: moment("09:00", "HH:mm").format() }], 
                tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
            },
            phone: "010000000",
            email: "animalicapitale@romacapitale.it"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);
    });

    test("Creazione con conflitto", async function () {
        await curr_session.post('/hubs/').send({
            code: "BLQ1",
            name: "Animali carini e coccolosi di S.G. Srl",
            address: {
                city: "Bologna",
                street: "Via delle prove",
                number: "15/B",
                postal_code: "40100"
            },
            position: {
                type: "Point", coordinates: [0.0, 0.0]
            },
            opening_time: { 
                monday: [{ start: moment("9:00", "HH:mm").format(), end: moment("19:00", "HH:mm").format() }],
                tuesday: [{ start: moment("9:00", "HH:mm").format(),end: moment("19:00", "HH:mm").format() }],
                wednesday: [{ start: moment("9:00", "HH:mm").format(),end: moment("19:00", "HH:mm").format() }],
                thursday: [{ start: moment("9:00", "HH:mm").format(),end: moment("19:00", "HH:mm").format() }],
                friday: [{ start: moment("9:00", "HH:mm").format(),end: moment("19:00", "HH:mm").format() }],
                saturday: [
                    { start: moment("10:00", "HH:mm").format(), end: moment("13:00", "HH:mm").format() },
                    { start: moment("15:00", "HH:mm").format(), end: moment("17:00", "HH:mm").format() }
                ],
                sunday: [
                    { start: moment("10:00", "HH:mm").format(), end: moment("13:00", "HH:mm").format() },
                    { start: moment("15:00", "HH:mm").format(), end: moment("17:00", "HH:mm").format() }
                ]
            },
            phone: "051000000",
            email: "animalicarini@coccolosi.it"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(409);
    });

    test("Creazione con parametri mancanti", async function () {
        const res = await curr_session.post('/hubs/').send({
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);
    });
});

describe("Ricerca di hub", function() {
    test("Ricerca singolo", async function () {
        const hub = await curr_session.get('/hubs/BLQ1').expect(200);
        expect(hub).toBeDefined();
        expect(hub.body.code).toEqual("BLQ1");
        expect(moment(hub.body.opening_time.monday[0].start).local().format()).toEqual(moment("9:00", "HH:mm").local().format());
    });

    test("Ricerca totale", async function () {
        const hub = await curr_session.get('/hubs/').query({ page_size: 100, page_number: 0 }).expect(200);
        expect(hub).toBeDefined();
        expect(hub.body.length).toEqual(3);
        expect(hub.body[0].code).toEqual("MXP1");
        expect(hub.body[1].code).toEqual("BLQ1");
        expect(moment(hub.body[1].opening_time.monday[0].start).local().format()).toEqual(moment("9:00", "HH:mm").local().format());
        expect(hub.body[2].code).toEqual("BLQ2");
        expect(moment(hub.body[2].opening_time.wednesday[0].end).local().format()).toEqual(moment("23:00", "HH:mm").local().format());
    });

    test("Ricerca per vicinanza (1)", async function () {
        const res = await curr_session.get('/hubs/').query({ page_size: 100, page_number: 0, lat: 44.504122, lon: 11.317321 }).expect(200); // Ospedale Maggiore
        expect(res.body[0].code).toEqual("BLQ1");
        expect(res.body[1].code).toEqual("BLQ2");
    });

    test("Ricerca per vicinanza (2)", async function () {
        const res = await curr_session.get('/hubs/').query({ page_size: 100, page_number: 0, lat: 44.490653, lon: 11.361153 }).expect(200); // Sant'Orsola
        expect(res.body[0].code).toEqual("BLQ2");
        expect(res.body[1].code).toEqual("BLQ1");
    });

    test("Ricerca per vicinanza errata - Coordinata mancante", async function () {
        const res = await curr_session.get('/hubs/').query({ page_size: 100, page_number: 0, lat: 44.490653 }).expect(400);
        expect(res.body[0].field).toEqual("lon");
    });

    test("Ricerca per vicinanza con paginazione", async function () {
        let res = await curr_session.get('/hubs/').query({ page_size: 1, page_number: 0, lat: 44.504122, lon: 11.317321 }).expect(200); // Ospedale Maggiore
        expect(res.body.length).toEqual(1);
        expect(res.body[0].code).toEqual("BLQ1");

        res = await curr_session.get('/hubs/').query({ page_size: 1, page_number: 1, lat: 44.504122, lon: 11.317321 }).expect(200); // Ospedale Maggiore
        expect(res.body.length).toEqual(1);
        expect(res.body[0].code).toEqual("BLQ2");
    });

    test("Ricerca per servizio (1)", async function () {
        let res = await curr_session.get('/hubs/').query({ page_size: 50, page_number: 0, service_id: service1 }).expect(200);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].code=="BLQ1").toBeTruthy();
    });

    test("Ricerca per servizio (2)", async function () {
        let res = await curr_session.get('/hubs/').query({ page_size: 50, page_number: 0, service_id: service2 }).expect(200);
        expect(res.body.length).toEqual(2);
        expect((res.body[0].code=="BLQ1") || (res.body[0].code=="BLQ2")).toBeTruthy();
        expect((res.body[1].code=="BLQ1") || (res.body[1].code=="BLQ2")).toBeTruthy();
    });

    test("Ricerca per servizio (2)", async function () {
        let res = await curr_session.get('/hubs/').query({ page_size: 50, page_number: 0, service_id: service3 }).expect(200);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].code=="BLQ2").toBeTruthy();
    });
});

describe("Modifica di hub", function () {
    test("Modifica del nome", async function () {
        await curr_session.put('/hubs/BLQ1').send({
            name: "Animaletti carini Spa" // era Animali carini e coccolosi di S.G. Srl
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(200);

        const hub = await HubModel.findOne({ code: "BLQ1" }).exec();
        expect(hub).toBeDefined();
        expect(hub.code).toEqual("BLQ1");
        expect(hub.name).toEqual("Animaletti carini Spa");
    });

    test("Modifica dell'orario di apertura", async function () {
        await curr_session.put('/hubs/BLQ2').send({
            opening_time: { 
                monday: [{ start: moment("11:00", "HH:mm").format(), end: moment("19:00", "HH:mm").format() }],
                tuesday: [{ start: moment("04:00", "HH:mm").format(), end: moment("23:00", "HH:mm").format() }],
                wednesday: [{ start: moment("04:00", "HH:mm").format(), end: moment("23:00", "HH:mm").format() }],
                thursday: [{ start: moment("04:00", "HH:mm").format(), end: moment("23:00", "HH:mm").format() }],
                friday: [{ start: moment("04:00", "HH:mm").format(), end: moment("23:00", "HH:mm").format() }],
                saturday: [ ], sunday: [ ]
            },
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(200);

        const hub = await HubModel.findOne({ code: "BLQ2" }).exec();
        expect(hub).toBeDefined();
        expect(hub.code).toEqual("BLQ2");
        expect(hub.name).toEqual("Ancora Animali Srl");
        expect(moment(hub.opening_time.monday[0].start).local().format()).toEqual(moment("11:00", "HH:mm").local().format());
        expect(moment(hub.opening_time.tuesday[0].start).local().format()).toEqual(moment("04:00", "HH:mm").local().format());
    });

    test("Modifica dell'orario di apertura - Formato errato", async function () {
        await curr_session.put('/hubs/BLQ2').send({
            opening_time: { 
                monday: [{ start: moment("23:00", "HH:mm").format(), end: moment("24:00", "HH:mm").format() }],
                tuesday: [{ start: moment("23:00", "HH:mm").format(), end: moment("23:30", "HH:mm").format() }]
            },
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);
    });

    test("Modifica dell'orario di apertura - Intervallo di tempo errato", async function () {
        await curr_session.put('/hubs/BLQ2').send({
            opening_time: { 
                monday: [{ start: moment("19:00", "HH:mm").format(), end: moment("11:00", "HH:mm").format() }],
                tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
            },
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);
    });


    test("Modifica hub inesistente", async function () {
        await curr_session.put('/hubs/FCO1').send({
            name: "Clinica Veterinaria Pippo"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});

describe("Cancellazione di hub", function () {
    test("Cancellazione corretta", async function () {
        await curr_session.delete('/hubs/BLQ1').set({ Authorization: `Bearer ${admin_token}` }).expect(204);

        const hub = await HubModel.findOne({ code: "BLQ1" }).exec();
        expect(hub).toBeNull();
    });

    test("Cancellazione corretta", async function () {
        await curr_session.delete('/hubs/BLQ2').set({ Authorization: `Bearer ${admin_token}` }).expect(204);

        const hub = await HubModel.findOne({ code: "BLQ2" }).exec();
        expect(hub).toBeNull();
    });

    test("Cancellazione hub inesistente", async function () {
        await curr_session.delete('/hubs/BLQ1710').set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});

describe("", function () {
    test("Pulizia", async function () {
        await utils.cleanup(curr_session);
    });
});
