require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');

const ServiceModel = require("../models/services/service");

let curr_session = session(app);

let admin_token;

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);
});

describe("Creazione di un servizio", function () {
    test("Creazione corretta", async function () {
        const res = await curr_session.post('/services/').send({
            name: "Vaccino antirabbia",
            description: "Vaccino antirabbia per il vostro animale domestico",
            duration: 60
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);
        expect(res.body).toBeDefined();

        const service = await ServiceModel.findOne({ name: "Vaccino antirabbia" }).exec();
        expect(service).toBeDefined();
        expect(service.name).toEqual("Vaccino antirabbia");
        expect(service.duration).toEqual(60);
    });

    test("Creazione corretta", async function () {
        await curr_session.post('/services/').send({
            name: "Dog-sitting",
            description: "Servizio di dog-sitting per il vostro cane (o tartaruga)",
            duration: 120
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);

        const service = await ServiceModel.findOne({ name: "Dog-sitting" }).exec();
        expect(service).toBeDefined();
        expect(service.name).toEqual("Dog-sitting");
        expect(service.duration).toEqual(120);
    });

    test("Creazione con conflitto", async function () {
        await curr_session.post('/services/').send({
            name: "Vaccino antirabbia",
            description: "Un altro vaccino antirabbia ma con lo stesso nome di prima",
            duration: 60
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(409);
    });

    test("Creazione con parametri mancanti", async function () {
        const res = await curr_session.post('/services/').send({
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);
    });
});

describe("Ricerca dei servizi", function() {
    test("Ricerca singola", async function () {
        const service = await curr_session.get('/services/Vaccino antirabbia').expect(200);
        expect(service).toBeDefined();
        expect(service.body.name).toEqual("Vaccino antirabbia");
        expect(service.body.duration).toEqual(60);
    });

    test("Ricerca totale", async function () {
        const services = await curr_session.get('/services/').expect(200);
        expect(services).toBeDefined();
        expect(services.body.length).toEqual(2);
        expect(services.body[0].name).toEqual("Vaccino antirabbia");
        expect(services.body[1].name).toEqual("Dog-sitting");
        expect(services.body[1].duration).toEqual(120);
    });
});

describe("Modifica di servizi", function () {
    test("Modifica del nome", async function () {
        await curr_session.put('/services/Vaccino antirabbia').send({
            name: "Fisioterapia" // era Vaccino antirabbia
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(200);

        const service = await ServiceModel.findOne({ name: "Fisioterapia" }).exec();
        expect(service).toBeDefined();
        expect(service.name).toEqual("Fisioterapia");
        expect(service.duration).toEqual(60);
    });

    test("Modifica servizio inesistente", async function () {
        await curr_session.put('/services/ServizioInesistente').send({
            name: "Nuovo servizio inesistente"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});

describe("Cancellazione di un servizio", function () {
    test("Cancellazione corretta", async function () {
        await curr_session.delete('/services/Fisioterapia').set({ Authorization: `Bearer ${admin_token}` }).expect(204);

        const service = await ServiceModel.findOne({ name: "Fisioterapia" }).exec();
        expect(service).toBeNull();
    });

    test("Cancellazione corretta", async function () {
        await curr_session.delete('/services/Dog-sitting').set({ Authorization: `Bearer ${admin_token}` }).expect(204);

        const service = await ServiceModel.findOne({ name: "Dog-sitting" }).exec();
        expect(service).toBeNull();
    });

    test("Cancellazione servizio inesistente", async function () {
        await curr_session.delete('/service/ServizioInesistente').set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});