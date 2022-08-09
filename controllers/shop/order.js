require('dotenv').config();
const validator = require("express-validator");
const utils = require("../../utilities");
const error = require("../../error_handler");
const OrderModel = require("../../models/shop/order");
const ProductModel = require("../../models/shop/product");
const HubModel = require("../../models/services/hub");
const moment = require("moment");

/* 
    Creazione di un ordine
*/
async function createOrder(req, res) {
    let new_order;
    let ordered_products_barcode = [];
    let ordered_products_quantity = {};
    let order_data = validator.matchedData(req);
    
    ordered_products_barcode = order_data.products.map((product) => product.barcode)
    for (const product of order_data.products) { ordered_products_quantity[product.barcode] = parseInt(product.quantity); };
    delete order_data.products;

    try {
        // Verifica esistenza hub
        if (order_data.pickup) {
            const hub = await HubModel.find({ code: order_data.hub_code }).exec();
            if (!hub) { throw error.generate.NOT_FOUND("Hub inesistente"); }
        }

        // Estrazione prodotti dell'ordine
        const products = await ProductModel.find({ barcode: {"$in": ordered_products_barcode} }).exec();
        if (products.length != ordered_products_barcode.length) { throw error.generate.NOT_FOUND("Sono presenti prodotti inesistenti"); }
        
        // Verifica quantità
        for (const product of products) {
            if (product.quantity < ordered_products_quantity[product.barcode]) { throw error.generate.BAD_REQUEST("Sono presenti prodotti non disponibili"); }
        }

        // Aggiornamento quantità
        for (const product of products) {
            await ProductModel.findByIdAndUpdate(product._id, { quantity: product.quantity - ordered_products_quantity[product.barcode] }).exec();
        }

        // Inserimento dati mancanti dell'ordine
        order_data.customer = req.auth.username;
        order_data.total = products.reduce((total, product) => total + parseInt(product.price)*ordered_products_quantity[product.barcode], 0);
        order_data.products = products.map((product) => ({
            barcode: product.barcode,
            name: product.name,
            price: product.price
        }));

        new_order = await new OrderModel(order_data).save();
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.CREATED).location(`${req.baseUrl}/orders/${new_order._id}`).json(new_order.getData());
}

/*
    Ricerca di ordini
*/
async function searchOrder(req, res) {
    let query = {};
    let orders = [];
    
    // Composizione query
    if (req.query.customer) { query.customer = req.query.customer; }
    if (req.query.status) { query.status = req.query.status; }
    if (req.query.start_date && req.query.end_date) { 
        query.creationDate = {
            "$gte": moment(req.query.start_date).startOf("day").format(),
            "$lte": moment(req.query.end_date).endOf("day").format(),
        }; 
    }
    
    try {
        orders = await OrderModel.find(query)
                            .sort({ creationDate: "desc" })
                            .limit(req.query.page_size)
                            .skip(req.query.page_number)
                            .exec();

        orders = orders.map((order) => order.getData());
    }
    catch (err) {
        console.warn(err);
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(orders);
}

/* 
    Ricerca di uno specifico ordine
*/
async function searchOrderById(req, res) {
    let order;

    try {
        order = await OrderModel.findById(req.params.order_id).exec();
        if (!order) { throw error.generate.NOT_FOUND("Ordine inesistente"); }
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(order.getData());
}

/* 
*/
async function updateOrder(req, res) {
    try {
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(await new_item.getData());
}

/* 
*/
async function removeOrder(req, res) {
    try {
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.sendStatus(utils.http.NO_CONTENT);
}

module.exports = {
    create: createOrder,
    search: searchOrder,
    searchById: searchOrderById,
    update: updateOrder,
    remove: removeOrder
}