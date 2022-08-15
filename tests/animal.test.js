require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');

const AnimalModel = require("../models/animals/animal");

let curr_session = session(app);

let admin_token;
let customer1;

let species1, species2;
let animal1, animal2;

const WRONG_MONGOID = "111111111111111111111111";

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);

    customer1 = await utils.loginAsCustomerWithPermission(curr_session, {});

    species1 = (await curr_session.post("/species/").send({ name: "Felino" }).set({ Authorization: `Bearer ${admin_token}` })).body;
    species2 = (await curr_session.post("/species/").send({ name: "Roditore" }).set({ Authorization: `Bearer ${admin_token}` })).body;
});

describe("Creazione degli animali", function () {
    test("Creazione corretta (1)", async function () {
        const res = await curr_session.post(`/user/customers/${customer1.username}/animals/`).send({
            species: species1.name,
            name: "Ghepardo",
            weight: 65000,
        }).set({ Authorization: `Bearer ${customer1.token}` }).expect(201);
        expect(res.body).toBeDefined();

        const animal = await AnimalModel.findById(res.body.id).exec();
        expect(animal).toBeDefined();
        expect(animal.name).toEqual("Ghepardo");
        animal1 = animal;
    });

    test("Creazione corretta (2)", async function () {
        const res = await curr_session.post(`/user/customers/${customer1.username}/animals/`).send({
            species: species2.name,
            name: "Topolino",
            weight: 200,
        }).set({ Authorization: `Bearer ${customer1.token}` }).expect(201);
        expect(res.body).toBeDefined();

        const animal = await AnimalModel.findById(res.body.id).exec();
        expect(animal).toBeDefined();
        expect(animal.name).toEqual("Topolino");
        animal2 = animal;
    });

    test("Creazione con parametri mancanti", async function () {
        const res = await curr_session.post(`/user/customers/${customer1.username}/animals/`).send({
        }).set({ Authorization: `Bearer ${customer1.token}` }).expect(400);
    });
});

describe("Ricerca degli animali", function() {
    test("Ricerca per id", async function () {
        const animal = await curr_session.get(`/animals/${animal1.id}`).expect(200);
        expect(animal).toBeDefined();
        expect(animal.body.name).toEqual("Ghepardo");
        expect(animal.body.species).toEqual(species1.name);
    });

    test("Ricerca animali di un cliente", async function () {
        const animals = await curr_session.get(`/user/customers/${customer1.username}/animals/`).expect(200);
        expect(animals).toBeDefined();
        expect(animals.body.length).toEqual(2);
        expect(animals.body[0].name).toEqual("Ghepardo");
        expect(animals.body[1].name).toEqual("Topolino");
    });
});

describe("Modifica degli animali", function () {
    test("Modifica dei parametri", async function () {
        await curr_session.put(`/user/customers/${customer1.username}/animals/${animal1.id}`).send({
            name: "Ghepardone",     // era Ghepardo
            height: 100             // era vuoto
        }).set({ Authorization: `Bearer ${customer1.token}` }).expect(200);

        const animal = await AnimalModel.findById(animal1.id).exec();
        expect(animal).toBeDefined();
        expect(animal.name).toEqual("Ghepardone");
        expect(animal.height).toEqual(100);
    });

    test("Modifica animale inesistente", async function () {
        await curr_session.put(`/user/customers/${customer1.username}/animals/${WRONG_MONGOID}`).send({
            name: "NuovoAnimalettoInesistente"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});

describe("Cancellazione degli animali", function () {
    test("Cancellazione corretta", async function () {
        await curr_session.delete(`/user/customers/${customer1.username}/animals/${animal1.id}`).set({ Authorization: `Bearer ${customer1.token}` }).expect(204);

        const animal = await AnimalModel.findById(animal1.id).exec();
        expect(animal).toBeNull();
    });

    test("Cancellazione corretta", async function () {
        await curr_session.delete(`/user/customers/${customer1.username}/animals/${animal2.id}`).set({ Authorization: `Bearer ${customer1.token}` }).expect(204);

        const animal = await AnimalModel.findById(animal2.id).exec();
        expect(animal).toBeNull();
    });

    test("Cancellazione specie inesistente", async function () {
        await curr_session.delete(`/user/customers/${customer1.username}/animals/${WRONG_MONGOID}`).set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});

describe("", function () {
    test("Pulizia", async function () {
        await utils.cleanup(curr_session);
        await curr_session.delete(`/species/${species1.name}`).set({ Authorization: `Bearer ${admin_token}` });
        await curr_session.delete(`/species/${species2.name}`).set({ Authorization: `Bearer ${admin_token}` });
    });
}); 