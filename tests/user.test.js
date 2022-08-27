require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');
const { createTime } = require("../utilities");
const bcrypt = require("bcrypt");

const HubModel = require("../models/services/hub");
const UserModel = require("../models/auth/user");
const PermissionModel = require("../models/auth/permission");


let curr_session = session(app);
let admin_token;

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);
});


describe("Registrazione di un cliente", function () {
    test("Registrazione corretta", async function () {
        await curr_session.post('/users/customers/').send({
            username: "Marcolino23", password: "MarcobelloNapoli32!",
            email: "marconi17@gmail.com", phone: "3212345678",
            name: "Luigi", surname: "Pirandello",
            address:{ city: "Salò", street: "Viale del vittoriale", number: "23", postal_code: "40100" }
        }).expect(201);

        const user = await UserModel.findOne({ username: "Marcolino23" }).populate("customer").exec();
        expect(user).toBeDefined();
        expect(await bcrypt.compare("MarcobelloNapoli32!", user.password)).toBeTruthy();
        expect(user.email).toEqual("marconi17@gmail.com");
        expect(user.customer).toBeDefined();
        expect(user.customer.address.city).toEqual("Salò");
    });

    test("Registrazione errata - username esistente", async function () {
        const res = await curr_session.post('/users/customers/').send({
            username: "Marcolino23", password: "SicuramenteNonMarcobelloNapoli32!", 
            email: "SicuramenteNonmarconi17@gmail.com", phone: "3212345678",
            name: "SicuramenteNonLuigi", surname: "SicuramenteNonPirandello",
            address: { city: "Sicuramente Non Salò", street: "Sicuramente Non Viale del vittoriale", number: "23", postal_code: "40100" }
        }).expect(409);
        expect(res.body.message).toBeDefined();
    });

    test("Registrazione errata - email esistente", async function () {
        const res = await curr_session.post('/users/customers/').send({
            username: "SicuramenteNonMarcolino23", password: "SicuramenteNonMarcobelloNapoli32!",
            email: "marconi17@gmail.com", phone: "3212345678",
            name: "SicuramenteNonLuigi", surname: "SicuramenteNonPirandello",
            address: { city: "Sicuramente Non Salò", street: "Sicuramente Non Viale del vittoriale", number: "23", postal_code: "40100" }
        }).expect(409);
        expect(res.body.message).toBeDefined();
    });
});

describe("Ricerca di un cliente", function () {
    test("Ricerca completa come admin", async function () {
        const res = await curr_session.get('/users/customers/Marcolino23').set({ Authorization: `Bearer ${admin_token}` }).expect(200);
        expect(res.body.username).toEqual("Marcolino23");
        expect(res.body.email).toEqual("marconi17@gmail.com");
        expect(res.body.address.city).toEqual("Salò");
    });

    test("Ricerca completa senza admin", async function () {
        await curr_session.get('/users/customers/Marcolino23').expect(401);
    });

    test("Ricerca profilo senza admin", async function () {
        const res = await curr_session.get('/users/profiles/Marcolino23').expect(200);
        expect(res.body.username).toEqual("Marcolino23");
        expect(res.body.email).not.toBeDefined();
    });
});

describe("Modifica della password di un cliente", function () {
    test("Modifica password come admin", async function () {
        await curr_session.put('/users/customers/Marcolino23').send({ 
            password: "MarcoBologna17!", enabled: false
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(200);

        const user = await UserModel.findOne({ username: "Marcolino23" }, { password: 1 }).exec();
        expect(await bcrypt.compare("MarcoBologna17!", user.password)).toBeTruthy();
    });

    test("Modifica password non soddisfacendo i requisiti minimi", async function () {
        let res = await curr_session.put('/users/customers/Marcolino23').send({ 
            password: "12345"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);
        expect(res.body[0].field).toEqual("password");
        expect(res.body[0].message).toBeDefined();
    });
});

describe("Cancellazione di un cliente", function () {
    test("Cancellazione come admin", async function () {
        await curr_session.delete('/users/customers/Marcolino23').set({ Authorization: `Bearer ${admin_token}` }).expect(204);
        
        expect(await UserModel.findOne({ username: "Marcolino23" }).exec()).toBeNull();
    });
});

// #############################################
// # FINE TEST CLIENTI - INIZIO TEST OPERATORI #
// #############################################


describe("Registrazione e cancellazione operatore - senza permesso admin (non autorizzato)", function () {
    test("Registrazione di un operatore", async function () {
        const hub = await HubModel.findOne({}).exec();
        const res = await curr_session.post('/users/operators/').send({
            username: "Luigino23", password: "LuiginoVerona33!",
            email: "luigino44@gmail.com",
            name: "Gabriele", surname: "D'Annunzio",
            role: "Pissicologo"
        }).expect(401);

        expect(await UserModel.findOne({ username: "Luigino23" }).exec()).toBeNull();
        expect(res.body.message).toBeDefined();
    });

    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login').send({ username: "Marcolino23", password: "MarcobelloNapoli32!" }).expect(401);
        expect(res.body.message).toEqual("Credenziali non valide");
    });

    test("Cancellazione di un operatore", async function () {
        const res = await curr_session.delete('/users/customers/Marcolino23').expect(401);
        expect(res.body.message).toBeDefined();
    });
});

describe("Registrazione e login operatore - tramite permesso admin", function () {
    test("Registrazione di un operatore", async function () {
        const hub = await HubModel.findOne({}).exec();
        await curr_session.post('/users/operators/').send({
            username: "Luigino234", password: "LuiginoVerona33!",
            email: "luigino444@gmail.com",
            name: "Gabriele", surname: "D'Annunzio",
            permission: { operator: true }, role: "Quoco"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);

        const user = await UserModel.findOne({ username: "Luigino234" }).populate("operator").exec();
        expect(user).toBeDefined();
        expect(await bcrypt.compare("LuiginoVerona33!", user.password)).toBeTruthy();
        expect(user.operator).toBeDefined();
    });

    test("Creazione di un cliente", async function () {
        await curr_session.post('/users/customers/').send({
            username: "Marcolino23", password: "MarcobelloNapoli32!", email: "marconi17@gmail.com",
            name: "Luigi", surname: "Pirandello",
            address: { city: "Salò", street: "Viale del vittoriale", number: "23", postal_code: "40100", phone: "3212345678" }
        }).expect(201);
    }),

    test("Registrazione errata di un operatore - username esistente come cliente", async function () {
        const res = await curr_session.post('/users/operators/').send({
            username: "Marcolino23", password: "LuiginoVerona33!",
            email: "sicuramentenonluigino44@gmail.com",
            name: "Gabriele", surname: "D'Annunzio",
            permission: { operator: true },
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(409);

        const user = await UserModel.findOne({ username: "Marcolino23" }).populate("operator").exec();
        expect(user.operator).toBeNull();
        expect(res.body.message).toBeDefined();
    });

    test("Registrazione errata di un operatore - email esistente come cliente", async function () {
        const res = await curr_session.post('/users/operators/').send({
            username: "NonSonoMarcolino23", password: "LuiginoVerona33!",
            email: "marconi17@gmail.com",
            name: "Gabriele", surname: "D'Annunzio",
            permission: { operator: true },
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(409);

        expect(await UserModel.findOne({ username: "NonSonoMarcolino23" }).exec()).toBeNull();
        const user = await UserModel.findOne({ email: "marconi17@gmail.com" }).populate("operator").exec();
        expect(user.operator).toBeNull();
        expect(res.body.message).toBeDefined();
    }),

    test("Cancellazione cliente", async function () {
        await curr_session.delete('/users/customers/Marcolino23').set({ Authorization: `Bearer ${admin_token}` }).expect(204);
    });

    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login').send({ username: "Luigino234", password: "LuiginoVerona33!" }).expect(200);
        expect(res.body.access_token).toBeDefined();
    });
});

describe("Ricerca di un operatore", function () {
    let token;
    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login').send({ username: "Luigino234", password: "LuiginoVerona33!" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
    });

    test("Ricerca di un operatore", async function () {
        const res = await curr_session.get('/users/operators/Luigino234').set({ Authorization: `Bearer ${token}` }).expect(200);

        expect(res.body.username).toEqual("Luigino234");
        expect(res.body.email).toEqual("luigino444@gmail.com");
    });

    test("Ricerca di un operatore senza login", async function () {
        await curr_session.get('/users/operators/Luigino234').expect(401);
    });

    test("Ricerca profilo di un operatore senza login", async function () {
        const res = await curr_session.get('/users/profiles/Luigino234').expect(200);
        expect(res.body.username).toEqual("Luigino234");
        expect(res.body.password).not.toBeDefined();
        expect(res.body.role).toEqual("Quoco");
    });
});

describe("Modifica di un operatore", function () {
    let token;
    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login').send({ username: "Luigino234", password: "LuiginoVerona33!" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
    });

    test("Modifica di sé stesso", async function () {
        await curr_session.put('/users/operators/Luigino234').send({ 
            password: "VeneziaVeneto18.",
            email: "newluigino01@gmail.com"
        }).set({ Authorization: `Bearer ${token}` }).expect(200);

        const user = await UserModel.findOne({ username: "Luigino234" }).populate("operator").exec();
        expect(user.email).toEqual("newluigino01@gmail.com");
        expect(await bcrypt.compare("VeneziaVeneto18.", user.password)).toBeTruthy();
    });

    test("Modifica di un utente diverso", async function () {
        const res = await curr_session.put('/users/operators/NonLuigino234').send({
            password: "VeneziaVeneto18.",
            email: "newluigino01@gmail.com"
        }).set({ Authorization: `Bearer ${token}` }).expect(403);
        expect(res.body.message).toBeDefined();
    });

    test("Modifica di un operatore come admin", async function () {
        await curr_session.put('/users/operators/Luigino234').send({ 
            password: "VeneziaVeneto18.",
            email: "newnewluigino01@gmail.com",
            role: "CEO"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(200);
    });

    test("Modifica permessi senza permesso admin", async function () {
        await curr_session.put('/users/operators/Luigino234').set({ Authorization: `Bearer ${token}` }).send({ 
            permission: { admin: true }
        }).expect(403);
    });
});


describe("Cancellazione di un operatore - tramite permesso admin", function () {
    test("Cancellazione di un operatore", async function () {
        await curr_session.delete('/users/operators/Luigino234').set({ Authorization: `Bearer ${admin_token}` }).expect(204);
    });

    test("Cancellazione di un operatore inesistente", async function () {
        await curr_session.delete('/users/operators/LuiginoFantasmino').set({ Authorization: `Bearer ${admin_token}` }).expect(404);
    });
});

describe("Ricerca di permessi", function () {
    test("Ricerca corretta", async function () {
        const res = await curr_session.get('/users/permissions/').set({ Authorization: `Bearer ${admin_token}` }).expect(200);
        expect(res.body.length).toBeGreaterThanOrEqual(0);
    });

    test("Ricerca corretta", async function () {
        await new PermissionModel({ name: "test_permission", urls: ["/admin/control_panel"] }).save();

        const res = await curr_session.get('/users/permissions/test_permission').set({ Authorization: `Bearer ${admin_token}` }).expect(200);
        expect(res.body.name).toEqual("test_permission");
        expect(res.body.urls).toEqual(["/admin/control_panel"]);

        await PermissionModel.findOneAndDelete({ name: "test_permission" });
    });
});