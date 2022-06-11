require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');
const { createTime } = require("../utilities");

const HubModel = require("../models/services/hub");
const RoleModel = require("../models/services/role");


let curr_session = session(app);
let test_role;
let admin_token;

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);
});


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
            phone: "3212345678",
            address:{
                city: "Salò", street: "Viale del vittoriale", number: "23", postal_code: "40100",
            }
        }).expect(201);
    });

    test("Registrazione errata di un cliente - username esistente", async function () {
        await curr_session.post('/user/customers/').send({
            username: "Marcolino23",
            password: "SicuramenteNonMarcobelloNapoli32!",
            email: "SicuramenteNonmarconi17@gmail.com",
            name: "SicuramenteNonLuigi",
            surname: "SicuramenteNonPirandello",
            phone: "3212345678",
            address: {
                city: "Sicuramente Non Salò", street: "Sicuramente Non Viale del vittoriale", number: "23", postal_code: "40100",
            }
        }).expect(409);
    });

    test("Registrazione errata di un cliente - email esistente", async function () {
        await curr_session.post('/user/customers/').send({
            username: "SicuramenteNonMarcolino23",
            password: "SicuramenteNonMarcobelloNapoli32!",
            email: "marconi17@gmail.com",
            name: "SicuramenteNonLuigi",
            surname: "SicuramenteNonPirandello",
            phone: "3212345678",
            address: {
                city: "Sicuramente Non Salò", street: "Sicuramente Non Viale del vittoriale", number: "23", postal_code: "40100",
            }
        }).expect(409);
    });
});

describe("Ricerca di un cliente - tramite permesso admin", function () {
    test("Ricerca di un cliente", async function () {
        const res = await curr_session.get('/user/customers/Marcolino23').set({ Authorization: `Bearer ${admin_token}` }).expect(200);
    });
});

describe("Modifica della password di un cliente", function () {
    test("Modifica password tramite permesso admin", async function () {
        await curr_session.put('/user/customers/Marcolino23').send({ 
            password: "MarcoBologna17!"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(200);
    });

    test("Modifica password non soddisfacendo i requisiti minimi", async function () {
        await curr_session.put('/user/customers/Marcolino23').send({ 
            password: "12345"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);
    });
});

describe("Cancellazione di un cliente - tramite permesso admin", function () {
    test("Cancellazione di un cliente", async function () {
        await curr_session.delete('/user/customers/Marcolino23').set({ Authorization: `Bearer ${admin_token}` }).expect(200);
    });
});

// #############################################
// # FINE TEST CLIENTI - INIZIO TEST OPERATORI #
// #############################################


describe("Registrazione e cancellazione operatore - senza permesso admin (non autorizzato)", function () {
    test("Registrazione di un operatore", async function () {
        const hub = await HubModel.findOne({}).exec();
        await curr_session.post('/user/operators/').send({
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
        await curr_session.post('/auth/login_operator').send({ username: "Marcolino23", password: "MarcobelloNapoli32!" }).expect(401);
    });

    test("Cancellazione di un operatore", async function () {
        await curr_session.delete('/user/customers/Marcolino23').expect(401);
    });
});

describe("Registrazione e login operatore - tramite permesso admin", function () {
    test("Registrazione di un operatore", async function () {
        const hub = await HubModel.findOne({}).exec();
        await curr_session.post('/user/operators/').send({
            username: "Luigino234", 
            password: "LuiginoVerona33!",
            email: "luigino444@gmail.com",
            name: "Gabriele",
            surname: "D'Annunzio",
            permission: { operator: true },
            role_id: test_role._id,
            working_time: {
                monday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                tuesday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                wednesday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                thursday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                friday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                saturday: [], sunday: []
            }
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);
    });

    test("Creazione di un cliente", async function () {
        await curr_session.post('/user/customers/').send({
            username: "Marcolino23", password: "MarcobelloNapoli32!", email: "marconi17@gmail.com",
            name: "Luigi", surname: "Pirandello",
            address: {
                city: "Salò", street: "Viale del vittoriale", number: "23", postal_code: "40100", phone: "3212345678"
            }
        }).expect(201);
    }),

    test("Registrazione errata di un operatore - username esistente come cliente", async function () {
        const hub = await HubModel.findOne({}).exec();
        await curr_session.post('/user/operators/').send({
            username: "Marcolino23",
            password: "LuiginoVerona33!",
            email: "sicuramentenonluigino44@gmail.com",
            name: "Gabriele",
            surname: "D'Annunzio",
            permission: { operator: true },
            role_id: test_role._id,
            working_time: {
                monday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                tuesday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                wednesday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                thursday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                friday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                saturday: [], sunday: []
            }
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(409);
    });

    test("Registrazione errata di un operatore - email esistente come cliente", async function () {
        const hub = await HubModel.findOne({}).exec();
        await curr_session.post('/user/operators/').send({
            username: "NonSonoMarcolino23",
            password: "LuiginoVerona33!",
            email: "marconi17@gmail.com",
            name: "Gabriele",
            surname: "D'Annunzio",
            permission: { operator: true },
            role_id: test_role._id,
            working_time: {
                monday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                tuesday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                wednesday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                thursday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                friday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                saturday: [], sunday: []
            }
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(409);
    }),

    test("Cancellazione cliente", async function () {
        await curr_session.delete('/user/customers/Marcolino23').set({ Authorization: `Bearer ${admin_token}` }).expect(200);
    });

    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Luigino234", password: "LuiginoVerona33!" }).expect(200);
        expect(res.body.access_token).toBeDefined();
    });
});

describe("Ricerca di un operatore", function () {
    let token;
    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Luigino234", password: "LuiginoVerona33!" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
    });

    test("Ricerca di un operatore", async function () {
        const res = await curr_session.get('/user/operators/Luigino234').set({ Authorization: `Bearer ${token}` }).expect(200);
    });
});

describe("Modifica di un operatore", function () {
    let token;
    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Luigino234", password: "LuiginoVerona33!" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
    });

    test("Modifica di un operatore", async function () {
        await curr_session.put('/user/operators/Luigino234').send({ 
            password: "VeneziaVeneto18.",
            email: "newluigino01@gmail.com"
        }).set({ Authorization: `Bearer ${token}` }).expect(200);
    });
});

describe("Modifica di un operatore - tramite permesso admin", function () {
    test("Modifica di un operatore", async function () {
        await curr_session.put('/user/operators/Luigino234').send({ 
            password: "VeneziaVeneto18.",
            email: "newnewluigino01@gmail.com"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(200);
    });
});

describe("Cancellazione di un operatore - tramite permesso admin", function () {
    test("Cancellazione di un operatore", async function () {
        await curr_session.delete('/user/operators/Luigino234').set({ Authorization: `Bearer ${admin_token}` }).expect(200);
    });
});


describe("Uscita", function () {
    test_role = test("Pulizia database", async function () {
        await RoleModel.deleteOne({ name: "Test" });
    });
});