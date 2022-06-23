require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');
const { createTime } = require("../utilities");
const bcrypt = require("bcrypt");

const HubModel = require("../models/services/hub");
const RoleModel = require("../models/services/role");
const UserModel = require("../models/auth/user");


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
    test("Registrazione corretta", async function () {
        await curr_session.post('/user/customers/').send({
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
        const res = await curr_session.post('/user/customers/').send({
            username: "Marcolino23", password: "SicuramenteNonMarcobelloNapoli32!", 
            email: "SicuramenteNonmarconi17@gmail.com", phone: "3212345678",
            name: "SicuramenteNonLuigi", surname: "SicuramenteNonPirandello",
            address: { city: "Sicuramente Non Salò", street: "Sicuramente Non Viale del vittoriale", number: "23", postal_code: "40100" }
        }).expect(409);
        expect(res.body.message).toBeDefined();
    });

    test("Registrazione errata - email esistente", async function () {
        const res = await curr_session.post('/user/customers/').send({
            username: "SicuramenteNonMarcolino23", password: "SicuramenteNonMarcobelloNapoli32!",
            email: "marconi17@gmail.com", phone: "3212345678",
            name: "SicuramenteNonLuigi", surname: "SicuramenteNonPirandello",
            address: { city: "Sicuramente Non Salò", street: "Sicuramente Non Viale del vittoriale", number: "23", postal_code: "40100" }
        }).expect(409);
        expect(res.body.message).toBeDefined();
    });
});

describe("Ricerca di un cliente", function () {
    test("Ricerca come admin", async function () {
        await curr_session.get('/user/customers/Marcolino23').set({ Authorization: `Bearer ${admin_token}` }).expect(200);
    });
});

describe("Modifica della password di un cliente", function () {
    test("Modifica password come admin", async function () {
        await curr_session.put('/user/customers/Marcolino23').send({ 
            password: "MarcoBologna17!"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(200);

        const user = await UserModel.findOne({ username: "Marcolino23" }, { password: 1 }).exec();
        expect(await bcrypt.compare("MarcoBologna17!", user.password)).toBeTruthy();
    });

    test("Modifica password non soddisfacendo i requisiti minimi", async function () {
        let res = await curr_session.put('/user/customers/Marcolino23').send({ 
            password: "12345"
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(400);
        expect(res.body[0].field).toEqual("password");
        expect(res.body[0].message).toBeDefined();
    });
});

describe("Cancellazione di un cliente", function () {
    test("Cancellazione come admin", async function () {
        await curr_session.delete('/user/customers/Marcolino23').set({ Authorization: `Bearer ${admin_token}` }).expect(200);
        
        expect(await UserModel.findOne({ username: "Marcolino23" }).exec()).toBeNull();
    });
});

// #############################################
// # FINE TEST CLIENTI - INIZIO TEST OPERATORI #
// #############################################


describe("Registrazione e cancellazione operatore - senza permesso admin (non autorizzato)", function () {
    test("Registrazione di un operatore", async function () {
        const hub = await HubModel.findOne({}).exec();
        const res = await curr_session.post('/user/operators/').send({
            username: "Luigino23", password: "LuiginoVerona33!",
            email: "luigino44@gmail.com",
            name: "Gabriele", surname: "D'Annunzio",
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

        expect(await UserModel.findOne({ username: "Luigino23" }).exec()).toBeNull();
        expect(res.body.message).toBeDefined();
    });

    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Marcolino23", password: "MarcobelloNapoli32!" }).expect(401);
        expect(res.body.message).toEqual("Credenziali non valide");
    });

    test("Cancellazione di un operatore", async function () {
        const res = await curr_session.delete('/user/customers/Marcolino23').expect(401);
        expect(res.body.message).toBeDefined();
    });
});

describe("Registrazione e login operatore - tramite permesso admin", function () {
    test("Registrazione di un operatore", async function () {
        const hub = await HubModel.findOne({}).exec();
        await curr_session.post('/user/operators/').send({
            username: "Luigino234", password: "LuiginoVerona33!",
            email: "luigino444@gmail.com",
            name: "Gabriele", surname: "D'Annunzio",
            permission: { operator: true }, role_id: test_role._id,
            working_time: {
                monday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                tuesday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                wednesday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                thursday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                friday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                saturday: [], sunday: []
            }
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);

        const user = await UserModel.findOne({ username: "Luigino234" }).populate("operator").exec();
        expect(user).toBeDefined();
        expect(await bcrypt.compare("LuiginoVerona33!", user.password)).toBeTruthy();
        expect(user.operator).toBeDefined();
        expect(user.operator.role_id).toBeDefined();
        expect(user.operator.working_time).toBeDefined();
        expect(user.operator.working_time.monday.length).toBeGreaterThanOrEqual(1);

    });

    test("Creazione di un cliente", async function () {
        await curr_session.post('/user/customers/').send({
            username: "Marcolino23", password: "MarcobelloNapoli32!", email: "marconi17@gmail.com",
            name: "Luigi", surname: "Pirandello",
            address: { city: "Salò", street: "Viale del vittoriale", number: "23", postal_code: "40100", phone: "3212345678" }
        }).expect(201);
    }),

    test("Registrazione errata di un operatore - username esistente come cliente", async function () {
        const res = await curr_session.post('/user/operators/').send({
            username: "Marcolino23", password: "LuiginoVerona33!",
            email: "sicuramentenonluigino44@gmail.com",
            name: "Gabriele", surname: "D'Annunzio",
            permission: { operator: true }, role_id: test_role._id,
            working_time: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(409);

        const user = await UserModel.findOne({ username: "Marcolino23" }).populate("operator").exec();
        expect(user.operator).toBeNull();
        expect(res.body.message).toBeDefined();
    });

    test("Registrazione errata di un operatore - email esistente come cliente", async function () {
        const res = await curr_session.post('/user/operators/').send({
            username: "NonSonoMarcolino23", password: "LuiginoVerona33!",
            email: "marconi17@gmail.com",
            name: "Gabriele", surname: "D'Annunzio",
            permission: { operator: true }, role_id: test_role._id,
            working_time: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] }
        }).set({ Authorization: `Bearer ${admin_token}` }).expect(409);

        expect(await UserModel.findOne({ username: "NonSonoMarcolino23" }).exec()).toBeNull();
        const user = await UserModel.findOne({ email: "marconi17@gmail.com" }).populate("operator").exec();
        expect(user.operator).toBeNull();
        expect(res.body.message).toBeDefined();
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

        expect(res.body.username).toEqual("Luigino234");
        expect(res.body.email).toEqual("luigino444@gmail.com");
    });
});

describe("Modifica di un operatore", function () {
    let token;
    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Luigino234", password: "LuiginoVerona33!" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
    });

    test("Modifica di sé stesso", async function () {
        await curr_session.put('/user/operators/Luigino234').send({ 
            password: "VeneziaVeneto18.",
            email: "newluigino01@gmail.com"
        }).set({ Authorization: `Bearer ${token}` }).expect(200);

        const user = await UserModel.findOne({ username: "Luigino234" }).populate("operator").exec();
        expect(user.email).toEqual("newluigino01@gmail.com");
        expect(await bcrypt.compare("VeneziaVeneto18.", user.password)).toBeTruthy();
    });

    test("Modifica di un utente diverso", async function () {
        const res = await curr_session.put('/user/operators/NonLuigino234').send({
            password: "VeneziaVeneto18.",
            email: "newluigino01@gmail.com"
        }).set({ Authorization: `Bearer ${token}` }).expect(403);
        expect(res.body.message).toBeDefined();
    });

    test("Modifica di un operatore come admin", async function () {
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