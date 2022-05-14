require("dotenv").config();
const request = require("supertest");
const app = require("../index.js");
const ms = require("ms"); 
const session = require('supertest-session');


describe("Autenticazione", function () {
    let curr_session = session(app);

    test("Login con credenziali corrette", async function () {
        const res = await curr_session.post('/auth/login').send({ username: "admin", password: "admin" }).expect(200);
        expect(res.body.access_token).toBeDefined();

        // Verifica validità access token
        let expected_expiration = (new Date()).getTime() + ms(process.env.ACCESS_TOKEN_EXP)
        expect(res.body.access_token.expiration).toBeGreaterThanOrEqual(expected_expiration - 5000);
        expect(res.body.access_token.expiration).toBeLessThan(expected_expiration + 5000);
    });

    const N_REFRESH_TEST = 3;
    for (let i = 0; i < N_REFRESH_TEST; i++) {
        test(`Rinnovo dei token (${i+1}/${N_REFRESH_TEST})`, async function () {
            const res = await curr_session.post('/auth/refresh').expect(200);
            expect(res.body.access_token).toBeDefined();
    
            // Verifica validità access token
            let expected_expiration = (new Date()).getTime() + ms(process.env.ACCESS_TOKEN_EXP)
            expect(res.body.access_token.expiration).toBeGreaterThanOrEqual(expected_expiration - 5000);
            expect(res.body.access_token.expiration).toBeLessThan(expected_expiration + 5000);
        });
    }

    test("Logout", async function () {
        res = await curr_session.post('/auth/logout').expect(200);
        res = await curr_session.post('/auth/refresh').expect(401);
    });
});

describe("Autenticazione errata", function () {
    test("Login con credenziali errate", async function () {
        const res = await request(app).post('/auth/login').send({ username: "username_sbagliato", password: "password_sbagliata" }).expect(401);
        expect(res.body.access_token).toBeUndefined();
    });

    test("Rinnovo dei token senza refresh token", async function () {
        const res = await request(app).post('/auth/refresh').expect(401);
        expect(res.body.access_token).toBeUndefined();
    });
});
