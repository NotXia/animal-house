require('dotenv').config();
const utils = require("../../utilities");
const error = require("../../error_handler");
const UserModel = require("../../models/auth/user");
const ItemModel = require("../../models/shop/item");

async function isProductAvailable(barcode, amount) {
    // Estrazione prodotto
    const product = await ItemModel.getProductByBarcode(barcode);
    if (!product) { throw error.generate.NOT_FOUND("Prodotto inesistente"); }

    return (product.quantity >= amount);
}

/* Inserimento di un prodotto nel carrello */
async function addToCart(req, res) {
    let cart_data;

    try {
        if (!await isProductAvailable(req.body.barcode, req.body.quantity)) { throw error.generate.BAD_REQUEST("Quantità insufficiente"); }

        // Estrazione dati cliente
        const user = await UserModel.findOne({ username: req.params.username }).exec();
        if (!user || user.isOperator()) { throw error.generate.NOT_FOUND("Utente inesistente"); }
        let customer = await user.findType();

        // Aggiornamento carrello
        let product_index = customer.cart.findIndex((cart_entry) => cart_entry.barcode === req.body.barcode);
        if (product_index != -1) { // Prodotto già in carrello
            customer.cart[product_index].quantity += req.body.quantity;
             // Verifica che la somma delle quantità sia ancora ammissibile
            if (!await isProductAvailable(req.body.barcode, customer.cart[product_index].quantity)) { throw error.generate.BAD_REQUEST("Quantità insufficiente"); }
        }
        else { // Prodotto nuovo
            customer.cart.push({ barcode: req.body.barcode, quantity: req.body.quantity });
        }
        await customer.save();

        cart_data = await customer.getCartData();
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(cart_data);
}

/* Lista del contenuto del carrello */
async function getCart(req, res) {
    let cart_data;

    try {
        // Estrazione dati cliente
        const user = await UserModel.findOne({ username: req.params.username }).exec();
        if (!user || user.isOperator()) { throw error.generate.NOT_FOUND("Utente inesistente"); }
        let customer = await user.findType();

        cart_data = await customer.getCartData();
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(cart_data);
}

/* Aggiornamento del carrello */
async function updateCart(req, res) {
    let cart_data;

    try {
        // Estrazione dati cliente
        const user = await UserModel.findOne({ username: req.params.username }).exec();
        if (!user || user.isOperator()) { throw error.generate.NOT_FOUND("Utente inesistente"); }
        let customer = await user.findType();

        // Controllo disponibilità
        for (const cart_entry of req.body.cart) {
            if (!await isProductAvailable(cart_entry.barcode, cart_entry.quantity)) { throw error.generate.BAD_REQUEST("Quantità insufficiente"); }
        }

        // Aggiornamento carrello
        customer.cart = req.body.cart;
        await customer.save();

        cart_data = await customer.getCartData();
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(cart_data);
}

module.exports = {
    addToCart: addToCart,
    getCart: getCart,
    updateCart: updateCart
}