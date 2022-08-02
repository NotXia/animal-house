require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');

const ServiceModel = require("../models/services/service");

let curr_session = session(app);

let admin_token;

let servizioTest;
let servizioTest2;
const WRONG_MONGOID = "111111111111111111111111";

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);
});

describe("Creazione di un servizio", function () {
    test("Creazione corretta", async function () {
        const res = await curr_session.post('/services/').send({
            name: "Vaccino antirabbia",
            description: "Vaccino antirabbia per il vostro animale domestico",
            duration: 60,
            price: 1000,
            target: ["Cane", "Gatto"]
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);
        expect(res.body).toBeDefined();

        const service = await ServiceModel.findOne({ name: "Vaccino antirabbia" }).exec();
        servizioTest = service;
        expect(service).toBeDefined();
        expect(service.name).toEqual("Vaccino antirabbia");
        expect(service.duration).toEqual(60);
        expect(service.target.length).toEqual(2);
        expect(service.target[1]).toEqual("Gatto");
    });

    test("Creazione corretta", async function () {
        await curr_session.post('/services/').send({
            name: "Dog-sitting",
            description: "Servizio di dog-sitting per il vostro cane (o tartaruga)",
            duration: 120,
            price: 500
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);

        const service = await ServiceModel.findOne({ name: "Dog-sitting" }).exec();
        servizioTest2 = service;
        expect(service).toBeDefined();
        expect(service.name).toEqual("Dog-sitting");
        expect(service.duration).toEqual(120);
    });

    test("Creazione con conflitto", async function () {
        await curr_session.post('/services/').send({
            name: "Vaccino antirabbia",
            description: "Un altro vaccino antirabbia ma con lo stesso nome di prima",
            duration: 60,
            price: 1000
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(409);
    });

    test("Creazione con parametri mancanti", async function () {
        const res = await curr_session.post('/services/').send({
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);
    });
});

describe("Ricerca dei servizi", function() {
    test("Ricerca singola", async function () {
        const service = await curr_session.get(`/services/${servizioTest._id}`).expect(200);
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
        await curr_session.put(`/services/${servizioTest._id}`).send({
            name: "Fisioterapia",   // era Vaccino antirabbia
            price: 3000,            // era 1000
            target: ["Cane"]        // era ["Cane", "Gatto"]
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(200);

        const service = await ServiceModel.findOne({ name: "Fisioterapia" }).exec();
        servizioTest = service;
        expect(service).toBeDefined();
        expect(service.name).toEqual("Fisioterapia");
        expect(service.duration).toEqual(60);
        expect(service.price).toEqual(3000);
        expect(service.target.length).toEqual(1);
        expect(service.target[0]).toEqual("Cane");
    });

    test("Modifica servizio inesistente", async function () {
        await curr_session.put(`/services/${WRONG_MONGOID}`).send({
            name: "Nuovo servizio inesistente"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});

describe("Cancellazione di un servizio", function () {
    test("Cancellazione corretta", async function () {
        await curr_session.delete(`/services/${servizioTest._id}`).set({ Authorization: `Bearer ${admin_token}` }).expect(204);

        const service = await ServiceModel.findOne({ name: "Fisioterapia" }).exec();
        expect(service).toBeNull();
    });

    test("Cancellazione corretta", async function () {
        await curr_session.delete(`/services/${servizioTest2._id}`).set({ Authorization: `Bearer ${admin_token}` }).expect(204);

        const service = await ServiceModel.findOne({ name: "Dog-sitting" }).exec();
        expect(service).toBeNull();
    });

    test("Cancellazione servizio inesistente", async function () {
        await curr_session.delete('/service/ServizioInesistente').set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});