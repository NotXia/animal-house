require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');

const SpeciesModel = require("../models/animals/species");

let curr_session = session(app);

let admin_token;

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);
});

describe("Creazione di una specie", function () {
    test("Creazione corretta", async function () {
        const res = await curr_session.post('/species/').send({
            name: "Roditore",
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);
        expect(res.body).toBeDefined();

        const species = await SpeciesModel.findOne({ name: "Roditore" }).exec();
        expect(species).toBeDefined();
        expect(species.name).toEqual("Roditore");
    });

    test("Creazione corretta", async function () {
        const res = await curr_session.post('/species/').send({
            name: "Pesce",
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);
        expect(res.body).toBeDefined();

        const species = await SpeciesModel.findOne({ name: "Pesce" }).exec();
        expect(species).toBeDefined();
        expect(species.name).toEqual("Pesce");
    });

    test("Creazione con conflitto", async function () {
        await curr_session.post('/species/').send({
            name: "Roditore",
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(409);
    });

    test("Creazione con spazio", async function () {
        await curr_session.post('/species/').send({
            name: "Roditore Australiano",
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);
    });

    test("Creazione con parametri mancanti", async function () {
        const res = await curr_session.post('/species/').send({
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);
    });
});

describe("Ricerca delle specie", function() {
    test("Ricerca totale", async function () {
        const species = await curr_session.get('/species/').expect(200);
        expect(species).toBeDefined();
        expect(species.body.length).toEqual(2);
        expect(species.body[0].name).toEqual("Roditore");
        expect(species.body[1].name).toEqual("Pesce");
    });

    test("Ricerca per nome", async function () {
        const species = await curr_session.get('/species/').query({ name: "Roditore" }).expect(200);
        expect(species).toBeDefined();
        expect(species.body.length).toEqual(1);
        expect(species.body[0].name).toEqual("Roditore");
    });
});

describe("Modifica di specie", function () {
    test("Modifica del nome", async function () {
        await curr_session.put(`/species/Roditore`).send({
            name: "Roditorone",   // era Roditore
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(200);

        const species = await SpeciesModel.findOne({ name: "Roditorone" }).exec();
        expect(species).toBeDefined();
        expect(species.name).toEqual("Roditorone");
    });

    test("Modifica specie inesistente", async function () {
        await curr_session.put(`/species/SpecieInesistente`).send({
            name: "NuovaSpecie"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});

describe("Cancellazione di una specie", function () {
    test("Cancellazione corretta", async function () {
        await curr_session.delete(`/species/Roditorone`).set({ Authorization: `Bearer ${admin_token}` }).expect(204);

        const species = await SpeciesModel.findOne({ name: "Roditore" }).exec();
        expect(species).toBeNull();
    });

    test("Cancellazione corretta", async function () {
        await curr_session.delete(`/species/Pesce`).set({ Authorization: `Bearer ${admin_token}` }).expect(204);

        const species = await SpeciesModel.findOne({ name: "Pesce" }).exec();
        expect(species).toBeNull();
    });

    test("Cancellazione specie inesistente", async function () {
        await curr_session.delete('/service/SpecieInesistente').set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});