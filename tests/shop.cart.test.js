require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');

const OrderModel = require("../models/shop/order");

let curr_session = session(app);
let itemA, itemB, itemC;
let customer1, customer2;

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);
    customer1 = await utils.loginAsCustomer(curr_session);
    customer2 = await utils.loginAsCustomer(curr_session);
});

describe("Popolazione dati", function () {
    test("Categorie", async function () {
        await curr_session.post('/shop/categories/').send({ name: "Alimenti" }).set({ Authorization: `Bearer ${admin_token}` }).expect(201);
    });

    test("Item", async function () {
        itemA = (await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "Cibo secco per gatti", category: "Alimenti", products: [
                    { barcode: "A12345", name: "Cibo secco per gatti (salmone)", price: 2000, quantity: 5 },
                    { barcode: "A23456", name: "Cibo secco per gatti (tartufo e caviale)", price: 25000, quantity: 1 },
                ]
            }).expect(201)).body;

        itemB = (await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "Cuccia", category: "Alimenti", products: [
                    { barcode: "B12345", name: "Cuccia", price: 3999, quantity: 15 },
                ]
            }).expect(201)).body;

        itemC = (await curr_session.post("/shop/items/")
            .set({ Authorization: `Bearer ${admin_token}` })
            .send({
                name: "Osso", category: "Alimenti", products: [
                    { barcode: "C12345", name: "Osso", price: 199, quantity: 20 },
                ]
            }).expect(201)).body;
    });
});

describe("Inserimento in carrello", function () {
    test("Inserimento corretto (1)", async function () {
        const res = await curr_session.post(`/users/customers/${customer1.username}/cart/`)
            .send({ barcode: "A12345", quantity: 2 })
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(200);
        expect(res.body.length).toEqual(1);
        expect(res.body[0].product.barcode).toEqual("A12345");
        expect(res.body[0].quantity).toEqual(2);
    });
    
    test("Inserimento corretto (2)", async function () {
        const res = await curr_session.post(`/users/customers/${customer1.username}/cart/`)
            .send({ barcode: "B12345", quantity: 1 })
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(200);
        expect(res.body.length).toEqual(2);
        expect(res.body[0].product.barcode).toEqual("A12345");
        expect(res.body[1].product.barcode).toEqual("B12345");
    });

    test("Inserimento corretto (3) - Incremento prodotto in carrello", async function () {
        const res = await curr_session.post(`/users/customers/${customer1.username}/cart/`)
            .send({ barcode: "A12345", quantity: 1 })
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(200);
        expect(res.body.length).toEqual(2);
        expect(res.body[0].product.barcode).toEqual("A12345");
        expect(res.body[0].quantity).toEqual(3);
        expect(res.body[1].product.barcode).toEqual("B12345");
    });

    test("Inserimento errato - Quantità insufficiente", async function () {
        await curr_session.post(`/users/customers/${customer1.username}/cart/`)
            .send({ barcode: "A12345", quantity: 2000 })
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(400);

        await curr_session.post(`/users/customers/${customer1.username}/cart/`)
            .send({ barcode: "C12345", quantity: 2000 })
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(400);
    });

    test("Inserimento errato - Prodotto inesistente", async function () {
        await curr_session.post(`/users/customers/${customer1.username}/cart/`)
            .send({ barcode: "Z12345", quantity: 1 })
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(404);
    });

    test("Inserimento errato - Permessi mancanti", async function () {
        await curr_session.post(`/users/customers/${customer1.username}/cart/`)
            .send({ barcode: "A12345", quantity: 1 })
            .set({ Authorization: `Bearer ${customer2.token}` }).expect(403);
    });
});

describe("Ricerca carrello", function () {
    test("Ricerca corretta", async function () {
        const res = await curr_session.get(`/users/customers/${customer1.username}/cart/`)
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(200);
        expect(res.body.length).toEqual(2);
        expect(res.body[0].product.barcode).toEqual("A12345");
        expect(res.body[0].quantity).toEqual(3);
        expect(res.body[1].product.barcode).toEqual("B12345");
        expect(res.body[1].quantity).toEqual(1);
    });

    test("Ricerca errata - Permessi mancanti", async function () {
        await curr_session.get(`/users/customers/${customer1.username}/cart/`)
            .set({ Authorization: `Bearer ${customer2.token}` }).expect(403);
    });
});

describe("Modifica carrello", function () {
    test("Modifica corretta (1)", async function () {
        const res = await curr_session.put(`/users/customers/${customer1.username}/cart/`)
            .send({ cart: [{ barcode: "A12345", quantity: 1 }, { barcode: "C12345", quantity: 2 }] })
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(200);
        expect(res.body.length).toEqual(2);
        expect(res.body[0].product.barcode).toEqual("A12345");
        expect(res.body[1].product.barcode).toEqual("C12345");
    });

    test("Modifica corretta (2)", async function () {
        const res = await curr_session.put(`/users/customers/${customer1.username}/cart/`)
            .send({ cart: [] })
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(200);
        expect(res.body.length).toEqual(0);
    });

    test("Modifica errata - Quantità insufficiente", async function () {
        await curr_session.put(`/users/customers/${customer1.username}/cart/`)
            .send({ cart: [{ barcode: "A12345", quantity: 1000 }] })
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(400);
    });

    test("Modifica errata - Permessi mancanti", async function () {
        await curr_session.put(`/users/customers/${customer1.username}/cart/`)
            .send({ cart: [] })
            .set({ Authorization: `Bearer ${customer2.token}` }).expect(403);
    });
});

describe("Pulizia", function () {
    test("", async function () {
        await OrderModel.deleteMany({});

        await curr_session.delete(`/shop/items/${itemA.id}`).set({ Authorization: `Bearer ${admin_token}` }).expect(204);
        await curr_session.delete(`/shop/items/${itemB.id}`).set({ Authorization: `Bearer ${admin_token}` }).expect(204);
        await curr_session.delete(`/shop/items/${itemC.id}`).set({ Authorization: `Bearer ${admin_token}` }).expect(204);
        await curr_session.delete('/shop/categories/Alimenti').set({ Authorization: `Bearer ${admin_token}` }).expect(204);
    });
});