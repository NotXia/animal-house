require("./init");
require("dotenv").config();
const request = require("supertest");
const app = require("../index.js");
const ms = require("ms");


describe("Autenticazione", function () {
    test("Login con credenziali corrette", async function () {
        const res = await request(app).post('/auth/login').send({ username: "admin", password: "admin" });

        expect(res.statusCode).toEqual(200);
        expect(res.body.access_token).toBeDefined();

        // Verifica validità access token
        let expected_expiration = (new Date()).getTime() + ms(process.env.ACCESS_TOKEN_EXP)
        expect(res.body.access_token.expiration).toBeGreaterThanOrEqual(expected_expiration - 5000);
        expect(res.body.access_token.expiration).toBeLessThan(expected_expiration + 5000);
    });
});

describe("Autenticazione errata", function () {
    test("Login con credenziali errate", async function () {
        const res = await request(app).post('/auth/login').send({ username: "username_sbagliato", password: "password_sbagliata" });

        expect(res.statusCode).toEqual(401);
        expect(res.body.access_token).toBeUndefined();
    });
});
