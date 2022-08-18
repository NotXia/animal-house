require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');
const path = require("path");
const fs = require("fs");
const PostModel = require("../models/blog/post");
const TopicModel = require("../models/blog/topic");

let curr_session = session(app);
let blog_posts = [];

let admin_token;
let operator1, operator2;
let operator_no_permission;

const img1 = path.resolve(path.join(__dirname, "/resources/img1.png"));
const img2 = path.resolve(path.join(__dirname, "/resources/img2.png"));

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);
    operator1 = await utils.loginAsOperatorWithPermission(curr_session, [ "post_write", "comment_write" ]);
    operator2 = await utils.loginAsOperatorWithPermission(curr_session, [ "post_write", "comment_write" ]);
    operator_no_permission = await utils.loginAsOperatorWithPermission(curr_session, []);

    await new TopicModel({ name: "Scoperte" }).save();
    await new TopicModel({ name: "Animali" }).save();
});


describe("Pubblicazione post", function () {
    const text = [
        "Ciao a tutti, oggi voglio parlarvi di questa nuova scoperta che ho fatto: se accarezzate il vostro cane lui verrà accarezzato. Grazie a tutti.",
        "Il mio cane ha fatto le fusa oggi! Troppo XD",
        "No vabbè, il pacchetto VIP è fantastico! Consiglio a tutti!"
    ]

    for (let i=0; i<text.length; i++) {
        test(`Pubblicazione post ${i+1}`, async function () {
            const res = await curr_session.post('/blog/posts/').send({ 
                content: text[i],
                topic: "Animali"
            }).set({ Authorization: `Bearer ${operator1.token}` }).expect(201);
            blog_posts.push(res.body);
    
            const post = await PostModel.findById(res.body.id).exec();
            expect(post).toBeDefined();
            expect(post.content).toEqual(text[i]);
        });
    }

    test(`Pubblicazione altro post`, async function () {
        const res = await curr_session.post('/blog/posts/').send({ 
            content: "Ciao",
            topic: "Animali"
        }).set({ Authorization: `Bearer ${operator2.token}` }).expect(201);
        blog_posts.push(res.body);
    });
});

describe("Pubblicazione post errate", function () {
    test("Pubblicazione post senza accesso", async function () {
        const res = await curr_session.post('/blog/posts/').send({ 
            content: "Ciao, non dovrei poter pubblicare questo interessantissimo post."
        }).expect(401);
        expect(res.body.message).toBeDefined();
    });

    test("Pubblicazione post senza permesso di scrittura", async function () {
        const res = await curr_session.post('/blog/posts/').send({ 
            content: "Ciao, non dovrei poter pubblicare questo interessantissimo post."
        }).set({ Authorization: `Bearer ${operator_no_permission.token}` }).expect(403);
        expect(res.body.message).toBeDefined();
    });
});

describe("Ricerca di un post di un dato utente", function () {
    test("Ricerca di tutti i post di un dato utente", async function () {
        const res = await curr_session.get('/blog/posts/')
            .query({ page_size: 5, page_number: 0, authors: [operator1.username] })
            .expect(200);
        expect(res.body.length).toEqual(3);
        for (post of res.body) { expect(post.author).toEqual(operator1.username); }
    });

    test("Ricerca di tutti i post di un dato utente inesistente", async function () {
        const res = await curr_session.get('/blog/posts/')
            .query({ page_size: 5, page_number: 0, authors: ["FantasmaLuigino23"] })
            .expect(200);
        expect(res.body.length).toEqual(0);
    });

    test("Ricerca di tutti i post di più utenti", async function () {
        const res = await curr_session.get('/blog/posts/')
            .query({ page_size: 5, page_number: 0, authors: [operator1.username, operator2.username] })
            .expect(200);
        expect(res.body.length).toEqual(4);
    });
});

describe("Ricerca di un dato post", function () {
    test("Ricerca post dato il suo id", async function () {
        const res = await curr_session.get('/blog/posts/'+ blog_posts[0].id).expect(200);
        expect(res.body.id).toEqual(blog_posts[0].id);
    });
});

describe("Pubblicazione commento", function () {
    test("Pubblicazione commento corretto", async function () {
        await curr_session.post('/blog/posts/'+ blog_posts[0].id +'/comments/').send({ 
            content: "Ciao Luigi, grazie per aver condiviso questa bellissima scoperta! \n Un saluto."
        }).set({ Authorization: `Bearer ${operator2.token}` }).expect(201);

        const post = await PostModel.findById(blog_posts[0].id).exec();
        expect(post.comments[0].author).toEqual(operator2.username);
        expect(post.comments[0].content).toEqual("Ciao Luigi, grazie per aver condiviso questa bellissima scoperta! \n Un saluto.");
    });
    
    test("Pubblicazione commento a post inesistente", async function () {
        const res = await curr_session.post('/blog/posts/111111111111111111111111/comments/').send({ 
            content: "Ciao, sto commentando un post inesistente! \n Un saluto."
        }).set({ Authorization: `Bearer ${operator2.token}` }).expect(404);
        expect(res.body.message).toBeDefined();
    });

    test("Pubblicazione altri commenti", async function () {
        await curr_session.post('/blog/posts/'+ blog_posts[0].id +'/comments/').send({ 
            content: "Bel post!!!11!!!11"
        }).set({ Authorization: `Bearer ${operator2.token}` }).expect(201);

        await curr_session.post('/blog/posts/'+ blog_posts[0].id +'/comments/').send({ 
            content: "Iscritto ricambi?"
        }).set({ Authorization: `Bearer ${operator2.token}` }).expect(201);
    });
});

describe("Ricerca dei commenti di un dato post", function () {
    test("Ricerca corretta commenti - Tutto in una pagina", async function () {
        const res = await curr_session.get(`/blog/posts/${blog_posts[0].id}/comments/`)
            .query({ page_size: 5, page_number: 0 }).expect(200);
        expect(res.body.length).toEqual(3);
        expect(res.body[0].index).toEqual(0);
        expect(res.body[1].index).toEqual(1);
        expect(res.body[2].index).toEqual(2);
    });

    test("Ricerca corretta commenti - Paginazione (1)", async function () {
        let res = await curr_session.get(`/blog/posts/${blog_posts[0].id}/comments/`)
            .query({ page_size: 1, page_number: 0 }).expect(200);
        expect(res.body[0].index).toEqual(0);

        res = await curr_session.get(`/blog/posts/${blog_posts[0].id}/comments/`)
            .query({ page_size: 1, page_number: 1 }).expect(200);
        expect(res.body[0].index).toEqual(1);
    });

    test("Ricerca corretta commenti - Paginazione (2)", async function () {
        res = await curr_session.get(`/blog/posts/${blog_posts[0].id}/comments/`)
            .query({ page_size: 2, page_number: 0 }).expect(200);
        expect(res.body.length).toEqual(2);
        expect(res.body[0].index).toEqual(0);
        expect(res.body[1].index).toEqual(1);

        res = await curr_session.get(`/blog/posts/${blog_posts[0].id}/comments/`)
            .query({ page_size: 2, page_number: 1 }).expect(200);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].index).toEqual(2);
    });

    test("Ricerca errata commenti - Parametri mancanti", async function () {
        await curr_session.get(`/blog/posts/${blog_posts[0].id}/comments/`).query({}).expect(400);
    });

    test("Ricerca corretta singolo commento", async function () {
        let res = await curr_session.get(`/blog/posts/${blog_posts[0].id}/comments/0`).expect(200);
        expect(res.body.index).toEqual(0);

        res = await curr_session.get(`/blog/posts/${blog_posts[0].id}/comments/1`).expect(200);
        expect(res.body.index).toEqual(1);
    });
});

describe("Modifica di un dato post", function () {
    test("Modifica post dato il suo id", async function () {
        await curr_session.put('/blog/posts/'+ blog_posts[0].id).send({
            topic: "Scoperte"
        }).set({ Authorization: `Bearer ${operator1.token}` }).expect(200);

        const post = await PostModel.findById(blog_posts[0].id).exec();
        expect(post.topic).toEqual("Scoperte");
    });
    
    test("Modifica post inesistente", async function () {
        const res = await curr_session.put('/blog/posts/111111111111111111111111').send({
            topic: "Scoperte"
        }).set({ Authorization: `Bearer ${operator1.token}` }).expect(404);
        expect(res.body.message).toBeDefined();
    });

    test("Modifica post non proprio", async function () {
        const res = await curr_session.put('/blog/posts/' + blog_posts[0].id).send({
            topic: "Animali"
        }).set({ Authorization: `Bearer ${operator2.token}` }).expect(403);

        const post = await PostModel.findById(blog_posts[0].id).exec();
        expect(post.topic).toEqual("Scoperte");
        expect(res.body.message).toBeDefined();
    });
});

describe("Modifica di un dato commento", function () {
    test("Modifica commento data la sua posizione", async function () {
        const res = await curr_session.put('/blog/posts/'+ blog_posts[0].id +'/comments/0').send({
            content: "Ciao Luigi, grazie per aver condiviso con noi questa bellissima e interessantissima scoperta! \n Un salutone."
        }).set({ Authorization: `Bearer ${operator2.token}` }).expect(200);

        const post = await PostModel.findById(blog_posts[0].id).exec();
        expect(post.comments[0].content).toEqual("Ciao Luigi, grazie per aver condiviso con noi questa bellissima e interessantissima scoperta! \n Un salutone.");
    });
    
    test("Modifica commento inesistente", async function () {
        const res = await curr_session.put('/blog/posts/'+ blog_posts[0].id +'/comments/3').send({
            content: "Ciao Luigi, grazie per aver condiviso con noi questa bellissima e interessantissima scoperta! \n Un salutone."
        }).set({ Authorization: `Bearer ${operator2.token}` }).expect(404);
        expect(res.body.message).toBeDefined();
    });

    test("Modifica commento non proprio", async function () {
        const res = await curr_session.put('/blog/posts/' + blog_posts[0].id + '/comments/0').send({
            content: "Ciao Mario, sei stato hackerato!!!! \n Un salutone."
        }).set({ Authorization: `Bearer ${operator1.token}` }).expect(403);

        const post = await PostModel.findById(blog_posts[0].id).exec();
        expect(post.comments[0].content).toEqual("Ciao Luigi, grazie per aver condiviso con noi questa bellissima e interessantissima scoperta! \n Un salutone.");
        expect(res.body.message).toBeDefined();
    });
});

describe("Cancellazione di un dato commento", function () {
    test("Cancellazione commento non proprio data la sua posizione", async function () {
        const res = await curr_session.delete('/blog/posts/' + blog_posts[0].id + '/comments/0').set({ Authorization: `Bearer ${operator1.token}` }).expect(403);

        const post = await PostModel.findById(blog_posts[0].id).exec();
        expect(post.comments[0].content).toEqual("Ciao Luigi, grazie per aver condiviso con noi questa bellissima e interessantissima scoperta! \n Un salutone.");
        expect(res.body.message).toBeDefined();
    });

    test("Cancellazione commento data la sua posizione", async function () {
        const post_before = await PostModel.findById(blog_posts[0].id).exec();

        await curr_session.delete('/blog/posts/'+ blog_posts[0].id +'/comments/0').set({ Authorization: `Bearer ${operator2.token}` }).expect(204);
        
        const post_after = await PostModel.findById(blog_posts[0].id).exec();
        expect(post_before.comments.length).toBeGreaterThan(post_after.comments.length);
    });
});

let post_with_image;

describe("Inserimento post con immagini", function () {
    test("Inserimento corretto", async function () {
        let res = await curr_session.post(`/files/images/`)
            .set({ Authorization: `Bearer ${admin_token}`, "content-type": "application/octet-stream" })
            .attach("file0", img1)
            .attach("file1", img2)
            .expect(200);
        const images_path = res.body;

        res = await curr_session.post('/blog/posts/').send({ 
            content: "Guardate che bei cavalli!!!!!!",
            topic: "Animali",
            images: [
                { path: images_path[0], description: "Un cavallo bello" },
                { path: images_path[1], description: "Un cavallo ancora più bello" }
            ]
        }).set({ Authorization: `Bearer ${operator1.token}` }).expect(201);
        blog_posts.push(res.body);
        post_with_image = res.body;

        const post = await PostModel.findById(res.body.id).exec();
        expect(post.images.length).toEqual(2);
        expect( fs.existsSync(path.join(process.env.BLOG_IMAGES_DIR_ABS_PATH, post.images[0].path)) ).toEqual(true);
        expect( fs.existsSync(path.join(process.env.BLOG_IMAGES_DIR_ABS_PATH, post.images[1].path)) ).toEqual(true);
    });

    test("Inserimento con immagini inesistenti", async function () {
        await curr_session.post('/blog/posts/').send({ 
            content: "Guardate che bei White-bellied go-away-bird ho fotografato questa mattina",
            topic: "Animali",
            images: [
                { path: "immagine_persa1.jpeg", description: "M'illumino" },
                { path: "immagine_persa2.jpeg", description: "d'immenso" }
            ]
        }).set({ Authorization: `Bearer ${operator1.token}` }).expect(404);
    });
});

describe("Aggiornamento post con immagini", function () {
    test("Aggiornamento corretto", async function () {
        let res = await curr_session.post(`/files/images/`)
            .set({ Authorization: `Bearer ${admin_token}`, "content-type": "application/octet-stream" })
            .attach("file0", img1)
            .attach("file1", img2)
            .expect(200);
        const images_path = res.body;

        res = await curr_session.put(`/blog/posts/${post_with_image.id}`).send({ 
            images: [
                { path: post_with_image.images[0].path, description: "Un cavallo bello" },
                { path: images_path[0], description: "La foto di prima era sbagliata, ho aggiornato con questo FANTASTICO CAVALLO!!!!!!!" },
                { path: images_path[1], description: "Come bonus ecco la foto di un canguro" }
            ]
        }).set({ Authorization: `Bearer ${operator1.token}` }).expect(200);

        const post = await PostModel.findById(res.body.id).exec();
        expect(post.images.length).toEqual(3);
        expect( fs.existsSync(path.join(process.env.BLOG_IMAGES_DIR_ABS_PATH, path.basename(post_with_image.images[0].path))) ).toEqual(true);
        expect( fs.existsSync(path.join(process.env.BLOG_IMAGES_DIR_ABS_PATH, post.images[0].path)) ).toEqual(true);
        expect( fs.existsSync(path.join(process.env.BLOG_IMAGES_DIR_ABS_PATH, post.images[1].path)) ).toEqual(true);
        expect( fs.existsSync(path.join(process.env.BLOG_IMAGES_DIR_ABS_PATH, path.basename(post_with_image.images[1].path))) ).toEqual(false);
    });

    test("Aggiornamento con immagine inesistente", async function () {
        res = await curr_session.put(`/blog/posts/${post_with_image.id}`).send({ 
            images: [
                { path: "ufo.png", description: "Ecco cosa ci nascondono 🛸" }
            ]
        }).set({ Authorization: `Bearer ${operator1.token}` }).expect(404);
    });
});

describe("Cancellazione di tutti i post - tramite permesso admin", function () {
    test("Cancellazione di tutti i post", async function () {
        for (const post of blog_posts) {
            await curr_session.delete('/blog/posts/' + post.id).set({ Authorization: `Bearer ${admin_token}` }).expect(204);
        }
    });
});

describe("Uscita", function () {
    test_role = test("Pulizia database", async function () {
        await TopicModel.deleteMany({});
        await utils.cleanup(curr_session);
    });
});