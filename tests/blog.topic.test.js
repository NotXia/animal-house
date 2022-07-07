require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');

const TopicModel = require("../models/blog/topic");

let curr_session = session(app);

let admin_token;
const base64_img = "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";

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);
});

describe("Ricerca di topic", function () {
    test("Ricerca senza topic nel db", async function () {
        await curr_session.get('/blog/topics/').expect(404);
    });
});

describe("Creazione di topic", function () {
    test("Creazione corretta", async function () {
        await curr_session.post('/blog/topics/').send({
            name: "Animali",
            icon: base64_img
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);

        const topic = await TopicModel.findOne({ name: "Animali" }).exec();
        expect(topic).toBeDefined();
        expect(topic.name).toEqual("Animali");
        expect(topic.icon).toEqual(base64_img);
    });


    test("Creazione con conflitto", async function () {
        await curr_session.post('/blog/topics/').send({
            name: "Animali"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(409);
    });

    test("Creazione con parametri mancanti", async function () {
        const res = await curr_session.post('/blog/topics/').send({
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);

        expect(res.body[0].field).toEqual("name");
    });

    test("Creazioni corrette", async function () {
        await curr_session.post('/blog/topics/').send({
            name: "Shop"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);

        await curr_session.post('/blog/topics/').send({
            name: "Alimenti"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);
    });
});

describe("Ricerca di topic", function () {
    test("Ricerca", async function () {
        const res = await curr_session.get('/blog/topics/').expect(200);

        expect(res.body.length).toEqual(3);
        expect(res.body[0].name).toEqual("Animali");
        expect(res.body[0].icon).toEqual(base64_img);
        expect(res.body[1].name).toEqual("Shop");
        expect(res.body[2].name).toEqual("Alimenti");
    });
});

describe("Modifica di topic", function () {
    test("Modifica dell'icona", async function () {
        let image = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        await curr_session.put('/blog/topics/Animali').send({
            icon: image
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(200);

        const topic = await TopicModel.findOne({ name: "Animali" }).exec();
        expect(topic.icon).toEqual(image);
    });

    test("Modifica del nome", async function () {
        const topic_icon = (await TopicModel.findOne({ name: "Animali" }).exec()).icon;

        await curr_session.put('/blog/topics/Animali').send({
            name: "Animals"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(200);

        const old_topic = await TopicModel.findOne({ name: "Animali" }).exec();
        expect(old_topic).toBeNull();
        const new_topic = await TopicModel.findOne({ name: "Animals" }).exec();
        expect(new_topic).toBeDefined();
        expect(new_topic.icon).toEqual(topic_icon);
    });

    test("Modifica topic inesistente", async function () {
        await curr_session.put('/blog/topics/NonEsisto').send({
            name: "Animals"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});

describe("Cancellazione di topic", function () {
    test("Cancellazione corretta", async function () {
        await curr_session.delete('/blog/topics/Animals').set({ Authorization: `Bearer ${admin_token}` }).expect(200);

        const topic = await TopicModel.findOne({ name: "Animals" }).exec();
        expect(topic).toBeNull();
    });

    test("Cancellazione topic inesistente", async function () {
        await curr_session.delete('/blog/topics/NeancheIoEsisto').set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});

describe("Pulizia", function () {
    test("Cancellazione topic", async function () {
        await curr_session.delete('/blog/topics/Shop').set({ Authorization: `Bearer ${admin_token}` }).expect(200);
        await curr_session.delete('/blog/topics/Alimenti').set({ Authorization: `Bearer ${admin_token}` }).expect(200);
    });
}); 
