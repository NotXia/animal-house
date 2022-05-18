require("dotenv").config();
const request = require("supertest");
const app = require("../index.js");
const ms = require("ms");
const session = require('supertest-session');


let curr_session = session(app);
let user = null;

describe("Registrazione e cancellazione operatore - senza permesso admin", function () {
    test("Registrazione di un operatore", async function () {
        const res = await curr_session.post('/user/operators/').send({ 
            username: "Marcolino23", 
            password: "MarcobelloNapoli32!",
            email: "marconi17@gmail.com",
            name: "Luigi",
            surname: "Pirandello",
        }).expect(401);
    });

    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Marcolino23", password: "MarcobelloNapoli32!" }).expect(401);
    });

    test("Cancellazione di un operatore", async function () {
        const res = await curr_session.delete('/user/customers/Marcolino23').expect(401);
    });
});

describe("Registrazione e cancellazione (tramite admin) cliente", function () {
    let token;
    test("Registrazione di un cliente", async function () {
        const res = await curr_session.post('/user/customers/').send({ 
            username: "Marcolino23", 
            password: "MarcobelloNapoli32!",
            email: "marconi17@gmail.com",
            name: "Luigi",
            surname: "Pirandello",
            city: "Salò", street: "Viale del vittoriale", number: "23", postal_code: "40100",
            phone: "3212345678"
        }).expect(200);
    });

    test("Login con credenziali admin", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "admin", password: "admin" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });

    test("Cancellazione di un cliente", async function () {
        const res = await curr_session.delete('/user/customers/Marcolino23').set({ Authorization: `Bearer ${token}` }).expect(200);
    });
});

// describe("Autenticazione", function () {
//     test("Login con credenziali admin", async function () {
//         const res = await curr_session.post('/auth/login_operator').send({ username: "admin", password: "admin" }).expect(200);
//         expect(res.body.access_token).toBeDefined();
//         user = res.body;
//     });
// });