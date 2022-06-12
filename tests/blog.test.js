require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');

const HubModel = require("../models/services/hub");
const RoleModel = require("../models/services/role");

let curr_session = session(app);
let test_role;
let blog_posts = [];

let admin_token;
let operator1, operator2;
let operator_no_permission;

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);
    operator1 = await utils.loginAsOperatorWithPermission(curr_session, { post_write: true, comment_write: true });
    operator2 = await utils.loginAsOperatorWithPermission(curr_session, { post_write: true, comment_write: true });
    operator_no_permission = await utils.loginAsOperatorWithPermission(curr_session, { post_write: false, comment_write: false });
});


describe("Pubblicazione post", function () {
    test("Pubblicazione post 1", async function () {
        const res = await curr_session.post('/blog/posts/').send({ 
            content: "Ciao a tutti, oggi voglio parlarvi di questa nuova scoperta che ho fatto: se accarezzate il vostro cane lui verrà accarezzato. Grazie a tutti.",
            // category: "testing assoluto"
        }).set({ Authorization: `Bearer ${operator1.token}` }).expect(201);
        blog_posts.push(res.body);
        // console.warn(blog_posts);
    });

    test("Pubblicazione post 2", async function () {
        const res = await curr_session.post('/blog/posts/').send({ 
            content: "Il mio cane ha fatto le fusa oggi! Troppo XD",
            // category: "testing assoluto"
        }).set({ Authorization: `Bearer ${operator1.token}` }).expect(201);
        blog_posts.push(res.body);
        // console.warn(blog_posts);
    });

    test("Pubblicazione post 3", async function () {
        const res = await curr_session.post('/blog/posts/').send({ 
            content: "No vabbè, il pacchetto VIP è fantastico! Consiglio a tutti!",
            // category: "testing assoluto"
        }).set({ Authorization: `Bearer ${operator1.token}` }).expect(201);
        blog_posts.push(res.body);
        // console.warn(blog_posts);
    });
});

describe("Pubblicazione commento", function () {
    test("Pubblicazione commento", async function () {
        await curr_session.post('/blog/posts/'+ blog_posts[0]._id +'/comments/').send({ 
            content: "Ciao Luigi, grazie per aver condiviso questa bellissima scoperta! \n Un saluto."
        }).set({ Authorization: `Bearer ${operator2.token}` }).expect(201);
    });
    
    test("Pubblicazione commento a post inesistente", async function () {
        await curr_session.post('/blog/posts/111111111111111111111111/comments/').send({ 
            content: "Ciao, sto commentando un post inesistente! \n Un saluto."
        }).set({ Authorization: `Bearer ${operator2.token}` }).expect(404);
    });
});

describe("Pubblicazione post senza accesso", function () {
    test("Pubblicazione post", async function () {
        await curr_session.post('/blog/posts/').send({ 
            content: "Ciao, non dovrei poter pubblicare questo interessantissimo post."
        }).expect(401);
    });
});

describe("Login di un operatore e pubblicazione post senza permesso di scrittura e modifica", function () {
    test("Pubblicazione post", async function () {
        const res = await curr_session.post('/blog/posts/').send({ 
            content: "Ciao, non dovrei poter pubblicare questo interessantissimo post."
        }).set({ Authorization: `Bearer ${operator_no_permission.token}` }).expect(403);
    });
});

describe("Ricerca di un post di un dato utente", function () {
    test("Ricerca di tutti i post di un dato utente", async function () {
        const res = await curr_session.get('/blog/posts/')
            .query({ page_size: 5, page_number: 0, username: operator1.username })
            .expect(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("Ricerca di tutti i post di un dato utente inesistente", async function () {
        await curr_session.get('/blog/posts/')
            .query({ page_size: 5, page_number: 0, username: "FantasmaLuigino23" })
            .expect(404);
    });
});

describe("Ricerca di un dato post", function () {
    test("Ricerca post dato il suo id", async function () {
        await curr_session.get('/blog/posts/'+ blog_posts[0]._id).expect(200);
    });
});

describe("Modifica di un dato post", function () {
    test("Modifica post dato il suo id", async function () {
        await curr_session.put('/blog/posts/'+ blog_posts[0]._id).send({
            category: "scoperte"
        }).set({ Authorization: `Bearer ${operator1.token}` }).expect(200);
    });
    
    test("Modifica post inesistente", async function () {
        await curr_session.put('/blog/posts/111111111111111111111111').send({
            category: "scoperte"
        }).set({ Authorization: `Bearer ${operator1.token}` }).expect(404);
    });
});

describe("Modifica di un dato commento", function () {
    
    test("Modifica commento data la sua posizione", async function () {
        await curr_session.put('/blog/posts/'+ blog_posts[0]._id +'/comments/0').send({
            content: "Ciao Luigi, grazie per aver condiviso con noi questa bellissima e interessantissima scoperta! \n Un salutone."
        }).set({ Authorization: `Bearer ${operator2.token}` }).expect(200);
    });
    
    test("Modifica commento inesistente", async function () {
        await curr_session.put('/blog/posts/'+ blog_posts[0]._id +'/comments/3').send({
            content: "Ciao Luigi, grazie per aver condiviso con noi questa bellissima e interessantissima scoperta! \n Un salutone."
        }).set({ Authorization: `Bearer ${operator2.token}` }).expect(404);
    });
});

describe("Cancellazione di un dato commento", function () {
    test("Cancellazione commento data la sua posizione", async function () {
        await curr_session.delete('/blog/posts/'+ blog_posts[0]._id +'/comments/0').set({ Authorization: `Bearer ${operator2.token}` }).expect(200);
    });
});

describe("Cancellazione di tutti i post - tramite permesso admin", function () {
    test("Cancellazione di tutti i post", async function () {
        for (const post of blog_posts) {
            await curr_session.delete('/blog/posts/' + post._id).set({ Authorization: `Bearer ${admin_token}` }).expect(200);
        }
    });
});

describe("Uscita", function () {
    test_role = test("Pulizia database", async function () {
        await utils.cleanup(curr_session);
    });
});