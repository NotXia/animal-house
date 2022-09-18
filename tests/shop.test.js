require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');
const path = require("path");
const fs = require("fs");

const ItemModel = require("../models/shop/item");
const ProductModel = require("../models/shop/product");

let curr_session = session(app);
let itemA, itemB, itemC;
const WRONG_MONGOID = "111111111111111111111111";
const img1 = path.resolve(path.join(__dirname, "/resources/img1.png"));
const img2 = path.resolve(path.join(__dirname, "/resources/img2.png"));

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);
});

describe("Popolazione dati", function () {
    test("Categorie", async function () {
        await curr_session.post('/shop/categories/').send({ name: "Alimenti" }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);
        await curr_session.post('/shop/categories/').send({ name: "Cacciaviti" }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);
    });
});

describe("Test inserimento", function () {
    test("Richiesta corretta a POST /shop/items/", async function () {
        let res = await curr_session.post(`/files/images/`)
            .set({ Authorization: `Bearer ${admin_token}`, "content-type": "application/octet-stream" })
            .attach("file0", img1)
            .attach("file1", img1)
            .attach("file2", img2)
            .expect(200);

        res = await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "Item_A", category: "Alimenti",
                products: [
                    { barcode: "A12345", name: "ProdottoA1", price: 1000, quantity: 5, images: [ {path: res.body[0], description: "A"}, {path: res.body[1], description: "B"} ] },
                    { barcode: "A23456", name: "ProdottoA2", price: 2000, images: [ {path: res.body[2], description: "C"} ] },
                ]
            }).expect(201);

        expect(res.body).toBeDefined();
        const item = await ItemModel.findOne({ name: "Item_A" }).exec();
        expect(res.body.id).toEqual(item._id.toString());
        expect(res.header.location).toEqual(`/shop/items/${item._id}`);
        expect(res.body.name).toEqual(item.name);
        expect(res.body.products.length).toEqual(item.products_id.length);
        expect( fs.existsSync(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, path.basename(res.body.products[0].images[0].path))) ).toBeTruthy();
        expect( fs.existsSync(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, path.basename(res.body.products[0].images[1].path))) ).toBeTruthy();
        expect( fs.existsSync(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, path.basename(res.body.products[1].images[0].path))) ).toBeTruthy();
        itemA = res.body;
    });

    test("Richiesta errata a POST /shop/items/ - Prodotti vuoti", async function () {
        await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "ItemE", description: "Prodotti vuoti", category: "Alimenti",
                products: []
            }).expect(400);
    });
    test("Richiesta errata a POST /shop/items/ - Prodotto senza barcode", async function () {
        await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "ItemE", description: "Prodotto senza barcode", category: "Alimenti",
                products: [{ name: "Prodotto", price: 1000, quantity: 5 },]
            }).expect(400);
    });
    test("Richiesta errata a POST /shop/items/ - Categoria mancante", async function () {
        await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "ItemE", description: "Categoria mancante",
                products: [{ barcode: "new54321", name: "Prodotto", price: 1000, quantity: 5 },]
            }).expect(400);
    });
    test("Richiesta errata a POST /shop/items/ - Categoria inesistente", async function () {
        await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "ItemE", description: "Categoria inesistente", category: "Tosaerba",
                products: [{ barcode: "new54321", name: "Prodotto", price: 1000, quantity: 5 },]
            }).expect(404);
    });
    test("Richiesta errata a POST /shop/items/ - Barcode esistente", async function () {
        res = await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "ItemE", description: "Barcode esistente", category: "Alimenti",
                products: [{ barcode: "A12345", name: "Prodotto", price: 1000, quantity: 5 },]
            }).expect(409);
        expect(res.body.field).toEqual("barcode");
        expect(res.body.message).toBeDefined();
    });
});

describe("Popolazione item", function () {
    test("", async function () {
        let res = await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "Item_B", category: "Cacciaviti",
                products: [
                    { barcode: "B12345", name: "ProdottoB1", price: 4000 },
                    { barcode: "B23456", name: "ProdottoB2", price: 5000 },
                ]
            }).expect(201);
        itemB = res.body;

        res = await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "Item_C", category: "Cacciaviti",
                products: [
                    { barcode: "C12345", name: "ProdottoB1", price: 100 },
                ]
            }).expect(201);
        itemC = res.body;
    });
});

describe("Test GET /shop/items/", function () {
    test("Richiesta corretta senza criteri", async function () {
        const res = await curr_session.get("/shop/items/").query({ page_size: 5, page_number: 0 }).expect(200);

        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toEqual(3);
    });

    test("Verifica ordinamento", async function () {
        let res = await curr_session.get("/shop/items/").query({ page_size: 5, page_number: 0, price_asc: true }).expect(200);
        expect((res.body[0].products.reduce((prev, curr) => prev.price < curr.price ? prev : curr).price)).toEqual(100);
        expect((res.body[1].products.reduce((prev, curr) => prev.price < curr.price ? prev : curr).price)).toEqual(1000);
        expect((res.body[2].products.reduce((prev, curr) => prev.price < curr.price ? prev : curr).price)).toEqual(4000);

        res = await curr_session.get("/shop/items/").query({ page_size: 5, page_number: 0, price_desc: true }).expect(200);
        expect(res.body[0].name).toEqual("Item_B");
        expect(res.body[1].name).toEqual("Item_A");
        expect(res.body[2].name).toEqual("Item_C");

        res = await curr_session.get("/shop/items/").query({ page_size: 5, page_number: 0, name_asc: true }).expect(200);
        expect(res.body[0].name).toEqual("Item_A");
        expect(res.body[1].name).toEqual("Item_B");
        expect(res.body[2].name).toEqual("Item_C");
    });
    
    test("Verifica paginazione", async function () {
        let res = await curr_session.get("/shop/items/").query({ page_size: 1, page_number: 0 }).expect(200);
        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toEqual(1);
        
        res = await curr_session.get("/shop/items/").query({ page_size: 2, page_number: 0 }).expect(200);
        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toEqual(2);

        res = await curr_session.get("/shop/items/").query({ page_size: 1, page_number: 0, name_asc: true }).expect(200);
        expect(res.body[0].name).toEqual("Item_A");
        res = await curr_session.get("/shop/items/").query({ page_size: 1, page_number: 1, name_asc: true }).expect(200);
        expect(res.body[0].name).toEqual("Item_B");
        res = await curr_session.get("/shop/items/").query({ page_size: 1, page_number: 2, name_asc: true }).expect(200);
        expect(res.body[0].name).toEqual("Item_C");
    });
    
    test("Richiesta non corretta", async function () {
        const res = await curr_session.get("/shop/items/").query({ name: "Tonno in barattolo", page_number: 0 }).expect(400);
        expect(res.body[0].message).toBeDefined();
    });
});

describe("Test GET /shop/items/:item_id", function () {
    test("Richieste corrette", async function () {
        let res = await curr_session.get(`/shop/items/${itemA.id}`).expect(200);
        expect(res.body.name).toEqual("Item_A");

        res = await curr_session.get(`/shop/items/${itemB.id}`).expect(200);
        expect(res.body.name).toEqual("Item_B");
    });

    test("Richiesta errata", async function () {
        await curr_session.get(`/shop/items/aaaa`).expect(400);

        const res = await curr_session.get(`/shop/items/${WRONG_MONGOID}`).expect(404);
        expect(res.body.message).toBeDefined();
    });
});

describe("Test GET /shop/items/barcode/:barcode", function () {
    test("Richiesta corretta", async function () {
        const res = await curr_session.get("/shop/items/barcode/A12345").expect(200);
        expect(res.body.name).toEqual("Item_A");
    });

    test("Richiesta vuota", async function () {
        const res = await curr_session.get("/shop/items/barcode/aaaa").expect(404);
        expect(res.body.message).toBeDefined();
    });
});

describe("Test modifica", function () {
    test("Richieste corrette a PUT /items/:item_id", async function () {
        const res = await curr_session.put(`/shop/items/${itemA.id}`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({ name: "NewItem1", description: "Nuova descrizione" }).expect(200);
        expect(res.body.name).toEqual("NewItem1");
        expect(res.body.description).toEqual("Nuova descrizione");

        const item = await ItemModel.findById(itemA.id).exec();
        expect(item.name).toEqual("NewItem1");
        expect(item.description).toEqual("Nuova descrizione");
        expect(item.category).toEqual("Alimenti");
    });
    
    test("Richiesta vuota a PUT /items/:item_id", async function () {
        // Perché mai dovresti voler modificare nulla :\
        await curr_session.put(`/shop/items/${itemA.id}`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({}).expect(200);
    });

    test("Richiesta scorretta a PUT /items/:item_id", async function () {
        await curr_session.put(`/shop/items/${WRONG_MONGOID}`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({ name: "NewItem1 modificato", description: "Nuova descrizione" }).expect(404);
    });

    test("Richieste corrette a PUT /items/:item_id/products/:product_index", async function () {
        let res = await curr_session.post(`/files/images/`)
            .set({ Authorization: `Bearer ${admin_token}`, "content-type": "application/octet-stream" })
            .attach("file2", img2)
            .expect(200);

        res = await curr_session.put(`/shop/items/${itemA.id}/products/0`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({ 
                name: "NewProdotto1", description: "Nuova descrizione", price: 6000, quantity: 20,
                images: [ {path: itemA.products[0].images[0].path, description: "D"}, {path: res.body[0], description: "E"} ]
            }).expect(200);

        expect(res.body.name).toEqual("NewProdotto1");
        expect(res.body.description).toEqual("Nuova descrizione");
        expect(res.body.price).toEqual(6000);
        expect(res.body.quantity).toEqual(20);
        expect( fs.existsSync(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, path.basename(res.body.images[0].path))) ).toBeTruthy();
        expect( fs.existsSync(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, path.basename(res.body.images[1].path))) ).toBeTruthy();
        expect( !fs.existsSync(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, path.basename(itemA.products[0].images[1].path))) ).toBeTruthy();
        
        const item = await ProductModel.findOne({ barcode: res.body.barcode }).exec();
        expect(item.name).toEqual("NewProdotto1");
        expect(item.description).toEqual("Nuova descrizione");
        expect(item.price).toEqual(6000);
        expect(item.quantity).toEqual(20);
    });

    test("Richieste errate a PUT /items/:item_id/products/:product_index", async function () {
        await curr_session.put(`/shop/items/${itemA.id}/products/100000`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({ name: "NewProdotto", description: "Nuova descrizione", price: 6000, quantity: 20 }).expect(404);

        const res = await curr_session.put(`/shop/items/${itemA.id}/products/1`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({ name: "NewProdotto", description: "Nuova descrizione", price: -1, quantity: 20 }).expect(400);
        expect(res.body[0].message).toBeDefined();
    });
});

describe("Test inserimento prodotto", function () {
    test("Richiesta corretta a POST /items/:item_id/products/", async function () {
        const item_old = (await curr_session.get(`/shop/items/${itemA.id}`).expect(200)).body;

        let res = await curr_session.post(`/files/images/`)
            .set({ Authorization: `Bearer ${admin_token}`, "content-type": "application/octet-stream" })
            .attach("file0", img1)
            .expect(200);
        const image = res.body[0];

        res = await curr_session.post(`/shop/items/${itemA.id}/products`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({ barcode: "A56789", name: "ProdottoNuovoA1", price: 1000, quantity: 5, images: [ {path: image, description: "AAA"} ] })
            .expect(201);
        expect(res.body.barcode).toEqual("A56789");

        const product = await ProductModel.findOne({ barcode: res.body.barcode }).exec();
        expect(product.name).toEqual("ProdottoNuovoA1");
        expect( fs.existsSync(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, path.basename(product.images[0].path))) ).toBeTruthy();

        const item_new = (await curr_session.get(`/shop/items/${itemA.id}`).expect(200)).body;
        expect(item_new.products.length).toEqual(item_old.products.length + 1);

        // Cancellazione del prodotto appena inserito
        await curr_session.delete(`/shop/items/${itemA.id}/products/${item_new.products.length-1}`).set({ Authorization: `Bearer ${admin_token}` }).expect(204);
    });
});

describe("Test cancellazione", function () {
    test("Richiesta corretta a DELETE /items/:item_id/products/:product_index", async function () {
        const probably_deleted_image = (await curr_session.get(`/shop/items/${itemA.id}`).expect(200)).body.products[1].images[0].path;

        await curr_session.delete(`/shop/items/${itemA.id}/products/1`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .expect(204);

        const products = (await curr_session.get(`/shop/items/${itemA.id}`).expect(200)).body.products;
        expect(products.length).toEqual(1);
        expect( !fs.existsSync(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, path.basename(probably_deleted_image))) ).toBeTruthy();
        expect(await ProductModel.findOne({ barcode: "A23456" }).exec()).toBeNull();
    });

    test("Richiesta a DELETE /items/:item_id/products/:product_index con item con un solo prodotto", async function () {
        const res = await curr_session.delete(`/shop/items/${itemA.id}/products/0`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .expect(303);

        expect(res.header.location).toEqual(`/shop/items/${itemA.id}`);
        expect(res.body.message).toBeDefined();
    });

    test("Richiesta corretta a DELETE /items/:item_id", async function () {
        await curr_session.delete(`/shop/items/${itemA.id}`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .expect(204);

        expect(await ItemModel.findById(itemA.id).exec()).toBeNull();
        expect(await ProductModel.findOne({ barcode: "A12345" }).exec()).toBeNull();
    });
});

describe("Pulizia", function () {
    test("", async function () {
        await curr_session.delete(`/shop/items/${itemB.id}`).set({ Authorization: `Bearer ${admin_token}` }).expect(204);
        await curr_session.delete(`/shop/items/${itemC.id}`).set({ Authorization: `Bearer ${admin_token}` }).expect(204);
        await curr_session.delete('/shop/categories/Alimenti').set({ Authorization: `Bearer ${admin_token}` }).expect(204);
        await curr_session.delete('/shop/categories/Cacciaviti').set({ Authorization: `Bearer ${admin_token}` }).expect(204);
    });
});