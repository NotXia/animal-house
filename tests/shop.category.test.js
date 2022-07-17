require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');

const CategoryModel = require("../models/shop/category");

let curr_session = session(app);

let admin_token;
const base64_img = "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"

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);
});

describe("Creazione di categorie", function () {
    test("Creazione corretta", async function () {
        await curr_session.post('/shop/categories/').send({
            name: "Acquari",
            icon: base64_img
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);

        const category = await CategoryModel.findOne({ name: "Acquari" }).exec();
        expect(category).toBeDefined();
        expect(category.name).toEqual("Acquari");
        expect(category.icon).toEqual(base64_img);
    });


    test("Creazione con conflitto", async function () {
        await curr_session.post('/shop/categories/').send({
            name: "Acquari"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(409);
    });

    test("Creazione con parametri mancanti", async function () {
        const res = await curr_session.post('/shop/categories/').send({
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);

        expect(res.body[0].field).toEqual("name");
    });

    test("Creazioni corrette", async function () {
        await curr_session.post('/shop/categories/').send({
            name: "Alimenti"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);

        await curr_session.post('/shop/categories/').send({
            name: "Giocattoli"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);
    });
});

describe("Ricerca di categorie", function () {
    test("Ricerca", async function () {
        const res = await curr_session.get('/shop/categories/').expect(200);

        expect(res.body.length).toEqual(3);
        expect(res.body[0].name).toEqual("Acquari");
        expect(res.body[0].icon).toEqual(base64_img);
        expect(res.body[1].name).toEqual("Alimenti");
        expect(res.body[2].name).toEqual("Giocattoli");
    });
});

describe("Modifica di categorie", function () {
    test("Modifica dell'icona", async function () {
        let image = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        await curr_session.put('/shop/categories/Acquari').send({
            icon: image
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(200);

        const category = await CategoryModel.findOne({ name: "Acquari" }).exec();
        expect(category.icon).toEqual(image);
    });

    test("Modifica del nome", async function () {
        const category_icon = (await CategoryModel.findOne({ name: "Acquari" }).exec()).icon;

        await curr_session.put('/shop/categories/Acquari').send({
            name: "Vasche"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(200);

        const old_category = await CategoryModel.findOne({ name: "Acquari" }).exec();
        expect(old_category).toBeNull();
        const new_category = await CategoryModel.findOne({ name: "Vasche" }).exec();
        expect(new_category).toBeDefined();
        expect(new_category.icon).toEqual(category_icon);
    });

    test("Modifica di una categoria inesistente", async function () {
        await curr_session.put('/shop/categories/NonEsisto').send({
            name: "Abbigliamento"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});

describe("Cancellazione di categorie", function () {
    test("Cancellazione corretta", async function () {
        await curr_session.delete('/shop/categories/Vasche').set({ Authorization: `Bearer ${admin_token}` }).expect(200);

        const category = await CategoryModel.findOne({ name: "Vasche" }).exec();
        expect(category).toBeNull();
    });

    test("Cancellazione di una categoria inesistente", async function () {
        await curr_session.delete('/shop/categories/NeancheIoEsisto').set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});

describe("Pulizia", function () {
    test("Cancellazione categorie", async function () {
        await curr_session.delete('/shop/categories/Alimenti').set({ Authorization: `Bearer ${admin_token}` }).expect(200);
        await curr_session.delete('/shop/categories/Giocattoli').set({ Authorization: `Bearer ${admin_token}` }).expect(200);
    });
}); 
