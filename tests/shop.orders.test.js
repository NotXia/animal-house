require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');

const OrderModel = require("../models/shop/order");
const ProductModel = require("../models/shop/product");

let curr_session = session(app);
let itemA, itemB, itemC;
let customer;

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);
    customer = await utils.loginAsCustomerWithPermission(curr_session, { customer: true });
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

describe("Inserimento ordine", function () {
    test("Inseriment corretto (1)", async function () {
        const res = await curr_session.post("/shop/orders/")
            .set({ Authorization: `Bearer ${customer.token}` })
            .send({
                products: [{ barcode: "A12345", quantity: 2 }],
                pickup: true, hub_code: "MXP1"
            }).expect(201);
        expect(res.body).toBeDefined();
        expect(res.header.location).toEqual(`/shop/orders/${res.body.id}`);

        const order = await OrderModel.findById(res.body.id).exec();
        expect(order.total).toEqual(4000);
        expect(order.hub_code).toEqual("MXP1");
        expect(order.products.length).toEqual(1);

        const product = await ProductModel.findOne({ barcode: "A12345" }).exec();
        expect(product.quantity).toEqual(3);
    });

    test("Inseriment corretto (2)", async function () {
        const res = await curr_session.post("/shop/orders/")
            .set({ Authorization: `Bearer ${customer.token}` })
            .send({
                products: [{ barcode: "A23456", quantity: 1 }, { barcode: "C12345", quantity: 2 }],
                pickup: false, address: { city: "Bologna", street: "Via vai", number: 42, postal_code: "40100" }
            }).expect(201);

        const order = await OrderModel.findById(res.body.id).exec();
        expect(order.total).toEqual(25398);
        expect(order.address.city).toEqual("Bologna");
        expect(order.products.length).toEqual(2);

        let product = await ProductModel.findOne({ barcode: "A23456" }).exec();
        expect(product.quantity).toEqual(0);
        product = await ProductModel.findOne({ barcode: "C12345" }).exec();
        expect(product.quantity).toEqual(18);
    });

    test("Inseriment errato - Prodotto non sufficiente", async function () {
        await curr_session.post("/shop/orders/")
            .set({ Authorization: `Bearer ${customer.token}` })
            .send({
                products: [{ barcode: "A23456", quantity: 10 }, { barcode: "C12345", quantity: 2 }],
                pickup: true, hub_code: "MXP1"
            }).expect(400);
    });

    test("Inseriment errato - Prodotto inesistente", async function () {
        await curr_session.post("/shop/orders/")
            .set({ Authorization: `Bearer ${customer.token}` })
            .send({
                products: [{ barcode: "Z12345", quantity: 1 }],
                pickup: true, hub_code: "MXP1"
            }).expect(404);
    });

    test("Inseriment errato - Hub inesistente", async function () {
        await curr_session.post("/shop/orders/")
            .set({ Authorization: `Bearer ${customer.token}` })
            .send({
                products: [{ barcode: "Z12345", quantity: 1 }],
                pickup: true, hub_code: "MXP2"
            }).expect(404);
    });
});

describe("Pulizia", function () {
    test("", async function () {
        await curr_session.delete(`/shop/items/${itemA.id}`).set({ Authorization: `Bearer ${admin_token}` }).expect(204);
        await curr_session.delete(`/shop/items/${itemB.id}`).set({ Authorization: `Bearer ${admin_token}` }).expect(204);
        await curr_session.delete(`/shop/items/${itemC.id}`).set({ Authorization: `Bearer ${admin_token}` }).expect(204);
        await curr_session.delete('/shop/categories/Alimenti').set({ Authorization: `Bearer ${admin_token}` }).expect(204);
    });
});