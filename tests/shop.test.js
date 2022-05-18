require("dotenv").config();
const request = require("supertest");
const app = require("../index.js");
const ms = require("ms");
const session = require('supertest-session');


let curr_session = session(app);
let user = null;

describe("Autenticazione", function () {
    test("Login con credenziali admin", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "admin", password: "admin" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        user = res.body;
    });
});

describe("Test GET /shop/items/", function () {
    test(`Richieste non corrette`, async function () {
        await curr_session.get('/shop/items/')
            .set({ Authorization: `Bearer ${user.access_token.value}` })
            .query({ category_id: "Cibo", name: "Tonno in scatola", page_size: 5, page_number: 0 })
            .expect(400);

        await curr_session.get('/shop/items/')
            .set({ Authorization: `Bearer ${user.access_token.value}` })
            .query({ name: "Tonno in barattolo", page_number: 0 })
            .expect(400);
    });

    test(`Richiesta vuota`, async function () {
        await curr_session.get('/shop/items/')
            .set({ Authorization: `Bearer ${user.access_token.value}` })
            .query({ name: "Tritolo", page_size: 5, page_number: 0 })
            .expect(404);
    });
});
