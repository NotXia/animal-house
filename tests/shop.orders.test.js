require("dotenv").config();
const app = require("../index.js");
const utils = require("./utils/utils");
const session = require('supertest-session');

const OrderModel = require("../models/shop/order");
const ItemModel = require("../models/shop/item");

let curr_session = session(app);
let itemA, itemB, itemC;
let customer1, customer2, operator;
let order1, order2, order3;

beforeAll(async function () {
    admin_token = await utils.loginAsAdmin(curr_session);
    customer1 = await utils.loginAsCustomer(curr_session);
    customer2 = await utils.loginAsCustomer(curr_session);
    operator = await utils.loginAsOperatorWithPermission(curr_session, [ "warehouse" ]);
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
            .set({ Authorization: `Bearer ${customer1.token}` })
            .send({
                products: [{ barcode: "A12345", quantity: 2 }],
                pickup: true, hub_code: "MXP1"
            }).expect(201);
        expect(res.body).toBeDefined();
        expect(res.header.location).toEqual(`/shop/orders/${res.body.id}`);
        order1 = res.body;

        const order = await OrderModel.findById(res.body.id).exec();
        expect(order.total).toEqual(4000);
        expect(order.hub_code).toEqual("MXP1");
        expect(order.products.length).toEqual(1);

        const product = await ItemModel.getProductByBarcode("A12345");
        expect(product.quantity).toEqual(3);
    });

    test("Inseriment corretto (2)", async function () {
        const res = await curr_session.post("/shop/orders/")
            .set({ Authorization: `Bearer ${customer1.token}` })
            .send({
                products: [{ barcode: "A23456", quantity: 1 }, { barcode: "C12345", quantity: 2 }],
                pickup: false, address: { city: "Bologna", street: "Via vai", number: 42, postal_code: "40100" }
            }).expect(201);
        order2 = res.body;

        const order = await OrderModel.findById(res.body.id).exec();
        expect(order.total).toEqual(25398);
        expect(order.address.city).toEqual("Bologna");
        expect(order.products.length).toEqual(2);

        let product = await ItemModel.getProductByBarcode("A23456");
        expect(product.quantity).toEqual(0);
        product = await ItemModel.getProductByBarcode("C12345");
        expect(product.quantity).toEqual(18);
    });

    test("Inseriment corretto (3)", async function () {
        const res = await curr_session.post("/shop/orders/")
            .set({ Authorization: `Bearer ${customer2.token}` })
            .send({
                products: [{ barcode: "C12345", quantity: 2 }],
                pickup: false, address: { city: "Bologna", street: "Via vai", number: 42, postal_code: "40100" }
            }).expect(201);
        order3 = res.body;
    });

    test("Inseriment errato - Prodotto non sufficiente", async function () {
        await curr_session.post("/shop/orders/")
            .set({ Authorization: `Bearer ${customer1.token}` })
            .send({
                products: [{ barcode: "A23456", quantity: 10 }, { barcode: "C12345", quantity: 2 }],
                pickup: true, hub_code: "MXP1"
            }).expect(400);
    });

    test("Inseriment errato - Prodotto inesistente", async function () {
        await curr_session.post("/shop/orders/")
            .set({ Authorization: `Bearer ${customer1.token}` })
            .send({
                products: [{ barcode: "Z12345", quantity: 1 }],
                pickup: true, hub_code: "MXP1"
            }).expect(404);
    });

    test("Inseriment errato - Hub inesistente", async function () {
        await curr_session.post("/shop/orders/")
            .set({ Authorization: `Bearer ${customer1.token}` })
            .send({
                products: [{ barcode: "Z12345", quantity: 1 }],
                pickup: true, hub_code: "MXP2"
            }).expect(404);
    });
});

describe("Ricerca ordine", function () {
    test("Ricerca come cliente - Tutti i propri ordini", async function () {
        const res = await curr_session.get("/shop/orders/")
            .query({ page_size: 10, page_number: 0, customer: customer1.username })
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(200);
        expect(res.body.length).toEqual(2);
        expect(res.body[0].id).toEqual(order2.id);
        expect(res.body[1].id).toEqual(order1.id);
    });

    test("Ricerca come cliente - Solo processati", async function () {
        const res = await curr_session.get("/shop/orders/")
            .query({ page_size: 10, page_number: 0, customer: customer1.username, status: "processed" })
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(200);
        expect(res.body.length).toEqual(0);
    });

    test("Ricerca come cliente - Non propri", async function () {
        await curr_session.get("/shop/orders/")
            .query({ page_size: 10, page_number: 0, customer: customer2.username })
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(403);
    });

    test("Ricerca come operatore", async function () {
        const res = await curr_session.get("/shop/orders/")
            .query({ page_size: 10, page_number: 0 })
            .set({ Authorization: `Bearer ${operator.token}` }).expect(200);
        expect(res.body.length).toEqual(3);
    });

    test("Ricerca come operatore - Cliente specifico", async function () {
        const res = await curr_session.get("/shop/orders/")
            .query({ page_size: 10, page_number: 0, customer: customer2.username })
            .set({ Authorization: `Bearer ${operator.token}` }).expect(200);
        expect(res.body.length).toEqual(1);
    });

    test("Ricerca ordine specifico come cliente - Proprio ordine", async function () {
        const res = await curr_session.get(`/shop/orders/${order1.id}`)
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(200);
        expect(res.body.id).toEqual(order1.id);
    });

    test("Ricerca ordine specifico come cliente - Ordine altrui", async function () {
        await curr_session.get(`/shop/orders/${order3.id}`)
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(403);
    });

    test("Ricerca ordine specifico come operatore", async function () {
        const res = await curr_session.get(`/shop/orders/${order3.id}`)
            .set({ Authorization: `Bearer ${operator.token}` }).expect(200);
        expect(res.body.id).toEqual(order3.id);
    });
});

describe("Aggiornamento ordine", function () {
    test("Aggiornamento corretto", async function () {
        const res = await curr_session.put(`/shop/orders/${order1.id}`)
            .send({ status: "processed", tracking: "123abc456def" })
            .set({ Authorization: `Bearer ${operator.token}` }).expect(200);
        expect(res.body).toBeDefined();

        const order = await OrderModel.findById(order1.id).exec();
        expect(order.status).toEqual("processed");
        expect(order.tracking).toEqual("123abc456def");
    });

    test("Aggiornamento errato - Stato non previsto", async function () {
        await curr_session.put(`/shop/orders/${order1.id}`)
            .send({ status: "cooking" })
            .set({ Authorization: `Bearer ${operator.token}` }).expect(400);
    });

    test("Aggiornamento errato - Permessi mancanti", async function () {
        await curr_session.put(`/shop/orders/${order1.id}`)
            .send({ status: "delivered" })
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(403);
    });
});

describe("Cancellazione ordine", function () {
    test("Cancellazione corretta come cliente", async function () {
        let product = await ItemModel.getProductByBarcode("A23456");
        expect(product.quantity).toEqual(0);
        product = await ItemModel.getProductByBarcode("C12345");
        expect(product.quantity).toEqual(16);
        
        await curr_session.delete(`/shop/orders/${order2.id}`)
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(204);

        const order = await OrderModel.findById(order2.id).exec();
        expect(order.status).toEqual("cancelled");

        product = await ItemModel.getProductByBarcode("A23456");
        expect(product.quantity).toEqual(1);
        product = await ItemModel.getProductByBarcode("C12345");
        expect(product.quantity).toEqual(18);
    });

    test("Cancellazione errata come cliente - Ordine già processato", async function () {
        await curr_session.delete(`/shop/orders/${order1.id}`)
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(403);

        const order = await OrderModel.findById(order1.id).exec();
        expect(order.status).toEqual("processed");
    });

    test("Cancellazione errata come cliente - Ordine non proprio", async function () {
        await curr_session.delete(`/shop/orders/${order3.id}`)
            .set({ Authorization: `Bearer ${customer1.token}` }).expect(403);
    });

    test("Cancellazione corretta come operatore", async function () {
        await curr_session.delete(`/shop/orders/${order1.id}`)
            .set({ Authorization: `Bearer ${operator.token}` }).expect(204);

        const order = await OrderModel.findById(order1.id).exec();
        expect(order.status).toEqual("cancelled");
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