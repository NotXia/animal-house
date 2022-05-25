require("dotenv").config();
const request = require("supertest");
const app = require("../index.js");
const ms = require("ms");
const session = require('supertest-session');
const { createTime } = require("../utilities");

const HubModel = require("../models/services/hub");
const RoleModel = require("../models/services/role");


let curr_session = session(app);
let user = null;
let test_role;

describe("Inizializzazione", function () {
    test("Popolazione database", async function () {
        test_role = await new RoleModel({ name: "Test" }).save();
    });
});

describe("Registrazione di un cliente", function () {
    test("Registrazione di un cliente", async function () {
        const res = await curr_session.post('/user/customers/').send({ 
            username: "Marcolino23", 
            password: "MarcobelloNapoli32!",
            email: "marconi17@gmail.com",
            name: "Luigi",
            surname: "Pirandello",
            city: "Salò", street: "Viale del vittoriale", number: "23", postal_code: "40100",
            phone: "3212345678"
        }).expect(201);
    });
});

describe("Ricerca di un cliente - tramite permesso admin", function () {
    let token;
    test("Login con credenziali admin", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "admin", password: "admin" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });

    test("Ricerca di un cliente", async function () {
        const res = await curr_session.get('/user/customers/Marcolino23').set({ Authorization: `Bearer ${token}` }).expect(200);
    });
});

describe("Modifica della password di un cliente - tramite permesso admin", function () {
    let token;
    test("Login con credenziali admin", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "admin", password: "admin" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });

    test("Modifica di un cliente", async function () {
        const res = await curr_session.put('/user/customers/Marcolino23').send({ 
            password: "MarcoBologna17!"
        }).set({ Authorization: `Bearer ${token}` }).expect(200);
    });
});

describe("Modifica della password di un cliente non soddisfacendo i requisiti minimi - tramite permesso admin.", function () {
    let token;
    test("Login con credenziali admin", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "admin", password: "admin" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });

    test("Modifica di un cliente", async function () {
        const res = await curr_session.put('/user/customers/Marcolino23').send({ 
            password: "12345"
        }).set({ Authorization: `Bearer ${token}` }).expect(400);
    });
});

describe("Cancellazione di un cliente - tramite permesso admin", function () {
    let token;
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

// #############################################
// # FINE TEST CLIENTI - INIZIO TEST OPERATORI #
// #############################################


describe("Registrazione e cancellazione operatore - senza permesso admin (non autorizzato)", function () {
    test("Registrazione di un operatore", async function () {
        const hub = await HubModel.findOne({}).exec();
        const res = await curr_session.post('/user/operators/').send({ 
            username: "Luigino23", 
            password: "LuiginoVerona33!",
            email: "luigino44@gmail.com",
            name: "Gabriele",
            surname: "D'Annunzio",
            role_id: test_role._id,
            working_time: {
                monday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                tuesday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                wednesday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                thursday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                friday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                saturday: [], sunday: []
            }
        }).expect(401);
    });

    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Marcolino23", password: "MarcobelloNapoli32!" }).expect(401);
    });

    test("Cancellazione di un operatore", async function () {
        const res = await curr_session.delete('/user/customers/Marcolino23').expect(401);
    });
});

describe("Registrazione e login operatore - tramite permesso admin", function () {
    let token;
    test("Login con credenziali admin", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "admin", password: "admin" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });

    test("Registrazione di un operatore", async function () {
        const hub = await HubModel.findOne({}).exec();
        const res = await curr_session.post('/user/operators/').send({ 
            username: "Luigino23", 
            password: "LuiginoVerona33!",
            email: "luigino44@gmail.com",
            name: "Gabriele",
            surname: "D'Annunzio",
            role_id: test_role._id,
            working_time: {
                monday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                tuesday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                wednesday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                thursday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                friday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                saturday: [], sunday: []
            }
        }).set({ Authorization: `Bearer ${token}` }).expect(201);
    });

    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Luigino23", password: "LuiginoVerona33!" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });
});

describe("Ricerca di un operatore", function () {
    let token;
    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Luigino23", password: "LuiginoVerona33!" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });

    test("Ricerca di un operatore", async function () {
        const res = await curr_session.get('/user/operators/Luigino23').set({ Authorization: `Bearer ${token}` }).expect(200);
    });
});

describe("Modifica di un operatore", function () {
    let token;
    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Luigino23", password: "LuiginoVerona33!" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });

    test("Modifica di un operatore", async function () {
        const res = await curr_session.put('/user/operators/Luigino23').send({ 
            password: "VeneziaVeneto18.",
            email: "newluigino01@gmail.com"
        }).set({ Authorization: `Bearer ${token}` }).expect(200);
    });
});

describe("Modifica di un operatore - tramite permesso admin", function () {
    let token;
    test("Login con credenziali admin", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "admin", password: "admin" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });

    test("Modifica di un operatore", async function () {
        const res = await curr_session.put('/user/operators/Luigino23').send({ 
            password: "VeneziaVeneto18.",
            email: "newluigino01@gmail.com"
        }).set({ Authorization: `Bearer ${token}` }).expect(200);
    });
});

describe("Cancellazione di un operatore - tramite permesso admin", function () {
    let token;
    test("Login con credenziali admin", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "admin", password: "admin" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });

    test("Cancellazione di un operatore", async function () {
        const res = await curr_session.delete('/user/operators/Luigino23').set({ Authorization: `Bearer ${token}` }).expect(200);
    });
});


describe("Uscita", function () {
    test_role = test("Pulizia database", async function () {
        await RoleModel.deleteOne({ name: "Test" });
    });
});