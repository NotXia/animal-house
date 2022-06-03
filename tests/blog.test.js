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
let blog_posts = [];
let test_user;

describe("Inizializzazione", function () {
    test("Popolazione database", async function () {
        test_role = await new RoleModel({ name: "Test" }).save();
    });
});

describe("Registrazione operatori - tramite permesso admin", function () {
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
            permission: {post_write: true, post_read: true, post_modify: true, comment_write: true, comment_read: true, comment_modify: true},
            working_time: {
                monday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                tuesday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                wednesday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                thursday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                friday: [{ time: { start: createTime("08:00"), end: createTime("17:00") }, hub_id: hub._id }],
                saturday: [], sunday: []
            }
        }).set({ Authorization: `Bearer ${token}` }).expect(201);
        test_user = res.body;
        // console.debug(test_user);
    });

    test("Registrazione di un operatore", async function () {
        const hub = await HubModel.findOne({}).exec();
        const res = await curr_session.post('/user/operators/').send({ 
            username: "Fabiello90", 
            password: "FabioneAH.99",
            email: "fabio@gmail.com",
            name: "Giovanni",
            surname: "Pascoli",
            role_id: test_role._id,
            permission: {post_write: true, post_read: true, post_modify: true, comment_write: true, comment_read: true, comment_modify: true},
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
});

describe("Login di un operatore e pubblicazione post", function () {
    let token;
    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Luigino23", password: "LuiginoVerona33!" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });
    
    test("Pubblicazione post", async function () {
        const res = await curr_session.post('/blog/posts/').send({ 
            content: "Ciao a tutti, oggi voglio parlarvi di questa nuova scoperta che ho fatto: se accarezzate il vostro cane lui verrà accarezzato. Grazie a tutti.",
            // category: "testing assoluto"
        }).set({ Authorization: `Bearer ${token}` }).expect(201);
        blog_posts.push(res.body);
        // console.debug(blog_posts);
    });
});

describe("Login di un operatore e pubblicazione commento", function () {
    let token;
    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Fabiello90", password: "FabioneAH.99" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });
    
    test("Pubblicazione commento", async function () {
        const res = await curr_session.post('/blog/posts/'+ blog_posts[0]._id +'/comments/').send({ 
            content: "Ciao Luigi, grazie per aver condiviso questa bellissima scoperta! \n Un saluto."
        }).set({ Authorization: `Bearer ${token}` }).expect(201);
    });
});

describe("Pubblicazione post senza accesso", function () {
    let token;
    
    test("Pubblicazione post", async function () {
        const res = await curr_session.post('/blog/posts/').send({ 
            content: "Ciao, non dovrei poter pubblicare questo interessantissimo post."
        }).set({ Authorization: `Bearer ${token}` }).expect(401);
    });
});

describe("Registrazione operatore senza permesso di scrittura o modifica", function () {
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
            username: "MarioSpasmo", 
            password: "Spasmolio_grande13",
            email: "mario.s13@gmail.com",
            name: "Giacomo",
            surname: "Leopardi",
            role_id: test_role._id,
            permission: {post_write: false, post_read: true, post_modify: false, comment_write: false, comment_read: true, comment_modify: false},
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
});

describe("Login di un operatore e pubblicazione post senza permesso di scrittura e modifica", function () {
    let token;
    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "MarioSpasmo", password: "Spasmolio_grande13" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });
    
    test("Pubblicazione post", async function () {
        const res = await curr_session.post('/blog/posts/').send({ 
            content: "Ciao, non dovrei poter pubblicare questo interessantissimo post."
        }).set({ Authorization: `Bearer ${token}` }).expect(403);
    });
});

describe("Ricerca di un post di un dato utente", function () {
    let token;
    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Fabiello90", password: "FabioneAH.99" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });
    
    test("Ricerca di tutti i post di un dato utente", async function () {
        const res = await curr_session.get('/blog/posts/users/Luigino23').set({ Authorization: `Bearer ${token}` }).expect(200);
    });
});

describe("Ricerca di un dato post", function () {
    let token;
    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Fabiello90", password: "FabioneAH.99" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });
    
    test("Ricerca post dato il suo id", async function () {
        const res = await curr_session.get('/blog/posts/'+ blog_posts[0]._id).set({ Authorization: `Bearer ${token}` }).expect(200);
    });
});

describe("Modifica di un dato post", function () {
    let token;
    test("Login di un operatore", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "Fabiello90", password: "FabioneAH.99" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });
    
    test("Modifica post dato il suo id", async function () {
        const res = await curr_session.put('/blog/posts/'+ blog_posts[0]._id).send({
            category: "scoperte"
        }).set({ Authorization: `Bearer ${token}` }).expect(200);
    });
});

describe("Cancellazione di tutti i post e tutti gli operatori - tramite permesso admin", function () {
    let token;
    test("Login con credenziali admin", async function () {
        const res = await curr_session.post('/auth/login_operator').send({ username: "admin", password: "admin" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        token = res.body.access_token.value;
        user = res.body;
    });

    test("Cancellazione di tutti i post", async function () {
        for (const post of blog_posts) {
            await curr_session.delete('/blog/posts/'+post._id).set({ Authorization: `Bearer ${token}` }).expect(200);
        }
    });

    test("Cancellazione di tutti gli operatori", async function () {
        await curr_session.delete('/user/operators/Luigino23').set({ Authorization: `Bearer ${token}` }).expect(200);
        await curr_session.delete('/user/operators/Fabiello90').set({ Authorization: `Bearer ${token}` }).expect(200);
        await curr_session.delete('/user/operators/MarioSpasmo').set({ Authorization: `Bearer ${token}` }).expect(200);
    });
});

describe("Uscita", function () {
    test_role = test("Pulizia database", async function () {
        await RoleModel.deleteOne({ name: "Test" });
    });
});