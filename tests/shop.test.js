require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');
const path = require("path");
const fs = require("fs");

const CategoryModel = require("../models/shop/category");
const ItemModel = require("../models/shop/item");
const ProductModel = require("../models/shop/product");

let curr_session = session(app);

// Per tracciare gli oggetti da eliminare alla fine
let categories_id = [];
let products_id = [];
let items_id = [];

let category;
let products = [];
let items = [];

let admin_token;

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);
});


describe("Popolazione database", function () {
    let tmp;

    test("Popolazione database", async function () {
        tmp = await new CategoryModel({ name: "Cibo" }).save();
        categories_id.push(tmp._id);
        category = tmp;

        tmp = await new ProductModel({ name: "Prodotto1", price: 2000, quantity: 5, barcode: "1", images_path: ["b", "a"] }).save();
        products_id.push(tmp._id);
        products.push(tmp);
        tmp = await new ProductModel({ name: "Prodotto2", price: 1000, barcode: "2" }).save();
        products_id.push(tmp._id);
        products.push(tmp);
        tmp = await new ProductModel({ name: "Prodotto3", price: 5000, barcode: "3" }).save();
        products_id.push(tmp._id);
        products.push(tmp);
        tmp = await new ProductModel({ name: "Prodotto4", price: 4000, barcode: "4" }).save();
        products_id.push(tmp._id);
        products.push(tmp);

        tmp = await new ItemModel({ name: "Item1", category_id: category, products_id: [products[0]._id] }).save();
        items_id.push(tmp._id);
        items.push(tmp);

        tmp = await new ItemModel({ name: "Item2", category_id: category, products_id: [products[1]._id, products[2]._id] }).save();
        items_id.push(tmp._id);
        items.push(tmp);

        tmp = await new ItemModel({ name: "Item3", category_id: category, products_id: [products[3]._id] }).save();
        items_id.push(tmp._id);
        items.push(tmp);
    });
});


describe("Test GET /shop/items/", function () {
    test("Richiesta corretta senza criteri", async function () {
        const res = await curr_session.get("/shop/items/").query({ page_size: 5, page_number: 0 }).expect(200);

        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toEqual(3);
        expect(res.body[0].image_path).toEqual("b");
        expect(res.body[1].min_price).toEqual(1000);
        expect(res.body[1].product_number).toEqual(2);
    });

    test("Verifica ordinamento", async function () {
        let res = await curr_session.get("/shop/items/").query({ page_size: 5, page_number: 0, price_asc: true }).expect(200);
        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toEqual(3);
        expect(res.body[0].min_price).toEqual(1000);
        expect(res.body[2].min_price).toEqual(4000);
        expect(res.body[0].min_price).toBeLessThanOrEqual(res.body[1].min_price);

        res = await curr_session.get("/shop/items/").query({ page_size: 5, page_number: 0, price_desc: true }).expect(200);
        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toEqual(3);
        expect(res.body[0].min_price).toEqual(4000);
        expect(res.body[2].min_price).toEqual(1000);
        expect(res.body[0].min_price).toBeGreaterThanOrEqual(res.body[1].min_price); 

        res = await curr_session.get("/shop/items/").query({ page_size: 5, page_number: 0, name_asc: true }).expect(200);
        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toEqual(3);
        expect(res.body[0].name).toEqual("Item1");
    });
    
    test("Verifica paginazione", async function () {
        let res = await curr_session.get("/shop/items/").query({ page_size: 1, page_number: 0 }).expect(200);
        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toEqual(1);
        
        res = await curr_session.get("/shop/items/").query({ page_size: 2, page_number: 0 }).expect(200);
        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toEqual(2);

        for (let i=0; i<3; i++) {
            res = await curr_session.get("/shop/items/").query({ page_size: 1, page_number: i, name_asc: true }).expect(200);
            expect(res.body).toEqual(expect.any(Array));
            expect(res.body.length).toEqual(1);
            expect(res.body[0].name).toEqual(`Item${i+1}`);
        }
    });
    
    test("Richieste non corrette", async function () {
        await curr_session.get("/shop/items/").query({ category_id: "Cibo", name: "Tonno in scatola", page_size: 5, page_number: 0 }).expect(400);
        const res = await curr_session.get("/shop/items/").query({ name: "Tonno in barattolo", page_number: 0 }).expect(400);
        expect(res.body[0].message).toBeDefined();
    });

    test("Richiesta vuota", async function () {
        const res = await curr_session.get("/shop/items/").query({ name: "Tritolo", page_size: 5, page_number: 0 }).expect(404);
        expect(res.body.message).toBeDefined();
    });
});

describe("Test GET /shop/items/:item_id/products", function () {
    test("Richiesta corretta", async function () {
        let res = await curr_session.get(`/shop/items/${items[0]._id}/products/`).expect(200);
        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toEqual(1);
        expect(res.body[0].name).toEqual("Prodotto1");

        res = await curr_session.get(`/shop/items/${items[1]._id}/products/`).expect(200);
        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toEqual(2);
        expect(res.body[0].name).toEqual("Prodotto2");
    });

    test("Richiesta errata", async function () {
        await curr_session.get(`/shop/items/aaaa/products`).expect(400);
        const res = await curr_session.get(`/shop/items/${products[0]._id}/products/`).expect(404);
        expect(res.body.message).toBeDefined();
    });
});

describe("Test GET /shop/items/:barcode", function () {
    test("Richiesta corretta", async function () {
        const res = await curr_session.get("/shop/items/1").set({ Authorization: `Bearer ${admin_token}` }).expect(200);
        expect(res.body.name).toEqual("Item1");
    });

    test("Richiesta non autenticata", async function () {
        await curr_session.get("/shop/items/1").expect(401);
    });

    test("Richiesta vuota", async function () {
        const res = await curr_session.get("/shop/items/aaaa").set({ Authorization: `Bearer ${admin_token}` }).expect(404);
        expect(res.body.message).toBeDefined();
    });
});

let item_id;
let to_delete_image;

describe("Test inserimento", function () {
    test("Richiesta corretta a POST /items/", async function () {
        const res = await curr_session.post("/shop/items/")
                        .set({ Authorization: `Bearer ${admin_token}` })
                        .send({
                            name: "NewItem1", description: "", category_id: category._id,
                            products: [
                                { barcode: "new12345", name: "NewProdotto1", price: 1000, quantity: 5 },
                                { barcode: "new23456", name: "NewProdotto2", price: 2000 },
                            ]
                        }).expect(201);
        expect(res.body.id).toBeDefined();
        const item = await ItemModel.findOne({ name: "NewItem1" }, {_id: 1}).exec();
        expect(res.body.id).toEqual(item._id.toString());
        expect(res.header.location).toEqual(`/shop/items/${item._id}`);

        item_id = res.body.id;
    });

    test("Richieste errate a POST /items/", async function () {
        await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "NewItem2", description: "", category_id: category._id,
                products: []
            }).expect(400);

        await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "NewItem3", description: "", category_id: category._id,
                products: [{ name: "NewProdotto3", price: 1000, quantity: 5 },]
            }).expect(400);

        let res = await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "NewItem4", description: "",
                products: [{ barcode: "new54321", name: "NewProdotto4", price: 1000, quantity: 5 },]
            }).expect(400);
        expect(res.body[0].message).toBeDefined();

        res = await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "NewItem5", description: "", category_id: category._id,
                products: [{ barcode: "new12345", name: "NewProdotto5", price: 1000, quantity: 5 },]
            }).expect(409);
        expect(res.body.field).toEqual("barcode");
        expect(res.body.message).toBeDefined();
    });

    test("Richiesta corretta a POST /items/:item_id/products/:product_index/images/", async function () {
        const img1 = path.resolve(path.join(__dirname, "/resources/img1.png"));
        const img2 = path.resolve(path.join(__dirname, "/resources/img2.png"));

        await curr_session.post(`/shop/items/${item_id}/products/0/images/`)
            .set({ Authorization: `Bearer ${admin_token}`, "content-type": "application/octet-stream" })
            .attach("file0", img1)
            .attach("file1", img1)
            .attach("file2", img2)
            .expect(200);

        await curr_session.post(`/shop/items/${item_id}/products/1/images/`)
            .set({ Authorization: `Bearer ${admin_token}`, "content-type": "application/octet-stream" })
            .attach("file0", img2)
            .expect(200);

        const products = (await curr_session.get(`/shop/items/${item_id}/products/`).expect(200)).body;
        expect(fs.existsSync(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, products[0].images_path[0]))).toBeTruthy();
        expect(fs.existsSync(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, products[0].images_path[1]))).toBeTruthy();
        expect(fs.existsSync(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, products[1].images_path[0]))).toBeTruthy();
        to_delete_image = products[1].images_path[0];
    });

    test("Richieste errate a POST /items/:item_id/products/:product_index/images/", async function () {
        const txt = path.resolve(path.join(__dirname, "/resources/txt.txt"));

        // Formato sbagliato
        await curr_session.post(`/shop/items/${item_id}/products/0/images/`)
            .set({ Authorization: `Bearer ${admin_token}`, "content-type": "application/octet-stream" })
            .attach("file0", txt)
            .expect(400);

        // Nessun file
        const res = await curr_session.post(`/shop/items/${item_id}/products/0/images/`)
            .set({ Authorization: `Bearer ${admin_token}`, "content-type": "application/octet-stream" })
            .expect(400);
        expect(res.body.message).toBeDefined();
    });
});

describe("Test modifica", function () {
    test("Richieste corrette a PUT /items/:item_id", async function () {
        const res = await curr_session.put(`/shop/items/${item_id}`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({ name: "NewItem1 modificato", description: "Nuova descrizione" }).expect(200);
        expect(res.body.name).toEqual("NewItem1 modificato");
        expect(res.body.description).toEqual("Nuova descrizione");
        const item = await ItemModel.findById(item_id).exec();
        expect(item.name).toEqual("NewItem1 modificato");
        expect(item.description).toEqual("Nuova descrizione");
        expect(item.category_id).toEqual(category._id);

        // Richiesta vuota (perché mai dovresti voler modificare nulla :|)
        await curr_session.put(`/shop/items/${item_id}`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({}).expect(200);
    });

    test("Richiesta scorretta a PUT /items/:item_id", async function () {
        let wrong_id = "111111111111111111111111";
        await curr_session.put(`/shop/items/${wrong_id}`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({ name: "NewItem1 modificato", description: "Nuova descrizione" }).expect(404);
    });

    test("Richieste corrette a PUT /items/:item_id/products/:product_index", async function () {
        const res = await curr_session.put(`/shop/items/${item_id}/products/0`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({ name: "NewProdotto1 modificato", description: "Nuova descrizione", price: 6000, quantity: 20 }).expect(200);
        expect(res.body.name).toEqual("NewProdotto1 modificato");
        expect(res.body.description).toEqual("Nuova descrizione");
        expect(res.body.price).toEqual(6000);
        expect(res.body.quantity).toEqual(20);
        const item = await ProductModel.findById(res.body._id).exec();
        expect(item.name).toEqual("NewProdotto1 modificato");
        expect(item.description).toEqual("Nuova descrizione");
        expect(item.price).toEqual(6000);
        expect(item.quantity).toEqual(20);

        // Richiesta vuota (perché mai dovresti voler modificare nulla :|)
        await curr_session.put(`/shop/items/${item_id}/products/0`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({}).expect(200);
    });

    test("Richieste errate a PUT /items/:item_id/products/:product_index", async function () {
        await curr_session.put(`/shop/items/${item_id}/products/100000`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({ name: "NewProdotto1 modificato", description: "Nuova descrizione", price: 6000, quantity: 20 }).expect(404);

        const res = await curr_session.put(`/shop/items/${item_id}/products/100000`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({ name: "NewProdotto1 modificato", description: "Nuova descrizione", price: -1, quantity: 20 }).expect(400);
        expect(res.body[0].message).toBeDefined();
    });
});

describe("Test cancellazione", function () {
    test("Richiesta corretta a DELETE /items/:item_id/products/:product_index/images/:image_index", async function () {
        const product0_before = (await curr_session.get(`/shop/items/${item_id}/products/`).expect(200)).body[0];

        await curr_session.delete(`/shop/items/${item_id}/products/0/images/0`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .expect(200);

        const product0_after = (await curr_session.get(`/shop/items/${item_id}/products/`).expect(200)).body[0];
        expect(product0_before.images_path.length).toEqual(3);
        expect(product0_after.images_path.length).toEqual(2);
        expect(!fs.existsSync(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, product0_before.images_path[0]))).toBeTruthy();
    });

    test("Richiesta corretta a DELETE /items/:item_id/products/:product_index", async function () {
        await curr_session.delete(`/shop/items/${item_id}/products/1`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .expect(200);

        const products = (await curr_session.get(`/shop/items/${item_id}/products/`).expect(200)).body;
        expect(products.length).toEqual(1);
        expect(!fs.existsSync(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, to_delete_image))).toBeTruthy();
        expect(await ProductModel.findOne({ barcode: "new23456" }).exec()).toBeNull();
    });

    test("Richiesta corretta a DELETE /items/:item_id/products/:product_index", async function () {
        const res = await curr_session.delete(`/shop/items/${item_id}/products/0`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .expect(303);

        expect(res.header.location).toEqual(`/shop/items/${item_id}`);
        console.warn(res.body);
        expect(res.body.message).toBeDefined();
    });

    test("Richiesta corretta a DELETE /items/:item_id", async function () {
        await curr_session.delete(`/shop/items/${item_id}`)
            .set({ Authorization: `Bearer ${admin_token}` })
            .expect(200);

        expect(await ItemModel.findById(item_id).exec()).toBeNull();
        expect(await ProductModel.findOne({ barcode: "new12345" }).exec()).toBeNull();
        expect(await ProductModel.findOne({ barcode: "new23456" }).exec()).toBeNull();
    });
});

describe("Pulizia", function () {
    test("Pulizia database", async function () {
        for (const id of categories_id) { await CategoryModel.findByIdAndDelete(id); }
        for (const id of products_id) { await ProductModel.findByIdAndDelete(id); }
        for (const id of items_id) { await ItemModel.findByIdAndDelete(id); }
    });
});