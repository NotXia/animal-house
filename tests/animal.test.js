require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');
const path = require("path");
const fs = require("fs");

const AnimalModel = require("../models/animals/animal");
const UserModel = require("../models/auth/user");

let curr_session = session(app);

let admin_token;
let customer1, customer2;

let species1, species2;
let animal1, animal2;

const WRONG_MONGOID = "111111111111111111111111";

const img1 = path.resolve(path.join(__dirname, "/resources/img1.png"));

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);

    customer1 = await utils.loginAsCustomer(curr_session, {});
    customer2 = await utils.loginAsCustomer(curr_session, {});

    species1 = (await curr_session.post("/animals/species/").send({ name: "Felino" }).set({ Authorization: `Bearer ${admin_token}` })).body;
    species2 = (await curr_session.post("/animals/species/").send({ name: "Roditore" }).set({ Authorization: `Bearer ${admin_token}` })).body;
});

describe("Creazione degli animali", function () {
    test("Creazione corretta senza immagine", async function () {
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

    test("Creazione corretta con immagine", async function () {
        let res = await curr_session.post(`/files/images/`).set({ Authorization: `Bearer ${customer1.token}`, "content-type": "application/octet-stream" }).attach("file0", img1);
        const image_path = res.body[0];

        res = await curr_session.post(`/user/customers/${customer1.username}/animals/`).send({
            species: species2.name,
            name: "Topolino",
            weight: 200,
            image_path: image_path
        }).set({ Authorization: `Bearer ${customer1.token}` }).expect(201);
        expect(res.body).toBeDefined();

        const animal = await AnimalModel.findById(res.body.id).exec();
        expect(animal).toBeDefined();
        expect(animal.name).toEqual("Topolino");
        expect(res.body.image_path).toEqual(path.join(process.env.CUSTOMER_ANIMAL_IMAGES_BASE_URL, animal.image_path));
        expect( fs.existsSync(path.join(process.env.CUSTOMER_ANIMAL_IMAGES_DIR_ABS_PATH, animal.image_path)) ).toBeTruthy();
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
        await curr_session.put(`/animals/${animal1.id}`).send({
            name: "Ghepardone",     // era Ghepardo
            height: 100             // era vuoto
        }).set({ Authorization: `Bearer ${customer1.token}` }).expect(200);

        const animal = await AnimalModel.findById(animal1.id).exec();
        expect(animal).toBeDefined();
        expect(animal.name).toEqual("Ghepardone");
        expect(animal.height).toEqual(100);
    });

    test("Modifica animale inesistente", async function () {
        await curr_session.put(`/animals/${WRONG_MONGOID}`).send({
            name: "NuovoAnimalettoInesistente"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });

    test("Modifica immagine", async function () {
        let res = await curr_session.post(`/files/images/`).set({ Authorization: `Bearer ${customer1.token}`, "content-type": "application/octet-stream" }).attach("file0", img1);
        const image_path = res.body[0];
        
        res = await curr_session.put(`/animals/${animal2.id}`).send({
            name: "Ghepardoneone",  // era Ghepardo
            height: 100,            // era vuoto
            image_path: image_path
        }).set({ Authorization: `Bearer ${customer1.token}` }).expect(200);

        const animal = await AnimalModel.findById(animal2.id).exec();
        expect(animal.name).toEqual("Ghepardoneone");
        expect(animal.height).toEqual(100);
        expect( fs.existsSync(path.join(process.env.CUSTOMER_ANIMAL_IMAGES_DIR_ABS_PATH, path.basename(animal2.image_path))) ).toBeFalsy();
        expect( fs.existsSync(path.join(process.env.CUSTOMER_ANIMAL_IMAGES_DIR_ABS_PATH, path.basename(res.body.image_path))) ).toBeTruthy();
        expect( fs.existsSync(path.join(process.env.CUSTOMER_ANIMAL_IMAGES_DIR_ABS_PATH, animal.image_path)) ).toBeTruthy();
        animal2 = res.body
    });
    
    test("Modifica animale senza permessi", async function () {
        await curr_session.put(`/animals/${animal1.id}`).send({
            name: "Ghepardone rapito"
        }).set({ Authorization: `Bearer ${customer2.token}` }).expect(403);
    });
});

describe("Cancellazione degli animali", function () {
    test("Cancellazione errata - Permessi mancanti", async function () {
        await curr_session.delete(`/animals/${animal1.id}`).set({ Authorization: `Bearer ${customer2.token}` }).expect(403);
    });

    test("Cancellazione corretta", async function () {
        await curr_session.delete(`/animals/${animal1.id}`).set({ Authorization: `Bearer ${customer1.token}` }).expect(204);

        const animal = await AnimalModel.findById(animal1.id).exec();
        expect(animal).toBeNull();

        // Controllo se l'utente ha ancora l'id dell'animale
        let user = await curr_session.get(`/user/customers/${customer1.username}/animals/`).set({ Authorization: `Bearer ${admin_token}` });
        expect(user.body.length).toEqual(1);        // Anziché 2
        expect(user.body[0].id).toEqual(animal2.id);

        user = await UserModel.findOne({ username: customer1.username }).exec();
        expect( (await user.findType()).animals_id.length ).toEqual(1);
        expect( (await user.findType()).animals_id[0].toString() ).toEqual(animal2.id);
    });

    test("Cancellazione corretta", async function () {
        await curr_session.delete(`/animals/${animal2.id}`).set({ Authorization: `Bearer ${customer1.token}` }).expect(204);

        const animal = await AnimalModel.findById(animal2.id).exec();
        expect(animal).toBeNull();
        expect( fs.existsSync(path.join(process.env.CUSTOMER_ANIMAL_IMAGES_DIR_ABS_PATH, path.basename(animal2.image_path))) ).toBeFalsy();
    });

    test("Cancellazione specie inesistente", async function () {
        await curr_session.delete(`/animals/${WRONG_MONGOID}`).set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});

describe("", function () {
    test("Pulizia", async function () {
        await utils.cleanup(curr_session);
        await curr_session.delete(`/animals/species/${species1.name}`).set({ Authorization: `Bearer ${admin_token}` });
        await curr_session.delete(`/animals/species/${species2.name}`).set({ Authorization: `Bearer ${admin_token}` });
    });
}); 