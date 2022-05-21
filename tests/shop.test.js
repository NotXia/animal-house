require("dotenv").config();
const app = require("../index.js");
const session = require('supertest-session');
const path = require("path");
const fs = require("fs");

const CategoryModel = require("../models/shop/category");
const ItemModel = require("../models/shop/item");
const ProductModel = require("../models/shop/product");

let curr_session = session(app);
let user = null;

// Per tracciare gli oggetti da eliminare alla fine
let categories_id = [];
let products_id = [];
let items_id = [];

let category;
let products = [];
let items = [];

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
        
        await curr_session.get("/shop/items/").query({ name: "Tonno in barattolo", page_number: 0 }).expect(400);
    });

    test("Richiesta vuota", async function () {
        await curr_session.get("/shop/items/").query({ name: "Tritolo", page_size: 5, page_number: 0 }).expect(404);
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
        await curr_session.get(`/shop/items/${products[0]._id}/products/`).expect(404);
    });
});

describe("Autenticazione", function () {
    test("Login con credenziali admin", async function () {
        const res = await curr_session.post("/auth/login_operator").send({ username: "admin", password: "admin" }).expect(200);
        expect(res.body.access_token).toBeDefined();
        user = res.body;
    });
});

describe("Test GET /shop/items/:barcode", function () {
    test("Richiesta corretta", async function () {
        const res = await curr_session.get("/shop/items/1").set({ Authorization: `Bearer ${user.access_token.value}` }).expect(200);
        expect(res.body.name).toEqual("Item1");
    });

    test("Richiesta non autenticata", async function () {
        await curr_session.get("/shop/items/1").expect(401);
    });

    test("Richiesta vuota", async function () {
        await curr_session.get("/shop/items/aaaa").set({ Authorization: `Bearer ${user.access_token.value}` }).expect(404);
    });
});

let item_id;
let to_delete_image;

describe("Test inserimento", function () {
    test("Richiesta corretta a POST /items/", async function () {
        const res = await curr_session.post("/shop/items/")
                        .set({ Authorization: `Bearer ${user.access_token.value}` })
                        .send({
                            name: "NewItem1", description: "", category_id: category._id,
                            products: [
                                { barcode: "new12345", name: "NewProdotto1", price: 1000, quantity: 5 },
                                { barcode: "new23456", name: "NewProdotto2", price: 2000 },
                            ]
                        }).expect(200);
        expect(res.body.id).toBeDefined();
        const item = await ItemModel.findOne({ name: "NewItem1" }, {_id: 1}).exec();
        expect(res.body.id).toEqual(item._id.toString());

        item_id = res.body.id;
    });

    test("Richieste errate a POST /items/", async function () {
        await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${user.access_token.value}` })
            .send({
                name: "NewItem2", description: "", category_id: category._id,
                products: []
            }).expect(400);

        await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${user.access_token.value}` })
            .send({
                name: "NewItem3", description: "", category_id: category._id,
                products: [{ name: "NewProdotto3", price: 1000, quantity: 5 },]
            }).expect(400);

        await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${user.access_token.value}` })
            .send({
                name: "NewItem4", description: "",
                products: [{ barcode: "new54321", name: "NewProdotto4", price: 1000, quantity: 5 },]
            }).expect(400);
    });

    test("Richiesta corretta a POST /items/:item_id/products/:product_index/images/", async function () {
        const img1 = path.resolve(path.join(__dirname, "/resources/img1.png"));
        const img2 = path.resolve(path.join(__dirname, "/resources/img2.png"));

        await curr_session.post(`/shop/items/${item_id}/products/0/images/`)
            .set({ Authorization: `Bearer ${user.access_token.value}`, "content-type": "application/octet-stream" })
            .attach("file0", img1)
            .attach("file1", img2)
            .expect(200);

        await curr_session.post(`/shop/items/${item_id}/products/1/images/`)
            .set({ Authorization: `Bearer ${user.access_token.value}`, "content-type": "application/octet-stream" })
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
            .set({ Authorization: `Bearer ${user.access_token.value}`, "content-type": "application/octet-stream" })
            .attach("file0", txt)
            .expect(400);

        // Nessun file
        await curr_session.post(`/shop/items/${item_id}/products/0/images/`)
            .set({ Authorization: `Bearer ${user.access_token.value}`, "content-type": "application/octet-stream" })
            .expect(400);
    });
});

describe("Test cancellazione", function () {
    test("Richiesta corretta a DELETE /items/:item_id/products/:product_index", async function () {
        await curr_session.delete(`/shop/items/${item_id}/products/1`)
            .set({ Authorization: `Bearer ${user.access_token.value}` })
            .expect(200);

        const products = (await curr_session.get(`/shop/items/${item_id}/products/`).expect(200)).body;
        expect(products.length).toEqual(1);
        expect(!fs.existsSync(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, to_delete_image))).toBeTruthy();
        expect(await ProductModel.findOne({ barcode: "new23456" }).exec()).toBeNull();
    });

    test("Richiesta corretta a DELETE /items/:item_id", async function () {
        await curr_session.delete(`/shop/items/${item_id}`)
            .set({ Authorization: `Bearer ${user.access_token.value}` })
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