require('dotenv').config();
const utils = require("../../utilities");
const error = require("../../error_handler");
const DiscountModel = require("../../models/discount");
const validator = require('express-validator');


/* Ricerca sconti di un prodotto */
async function getDiscounts(req, res) {
    let discounts = [];

    try {
        discounts = await DiscountModel.find({ type: "shop", identifier: req.params.barcode });
        discounts = discounts.map(discount => discount.getData());
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(discounts);
}

/* Aggiunta di uno sconto ad un prodotto */
async function addDiscount(req, res) {
    const discount_data = validator.matchedData(req);
    let discount;

    try {
        discount_data.type = "shop";
        discount_data.identifier = req.params.barcode;

        discount = new DiscountModel(discount_data);
        await discount.save();
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.CREATED).json(discount.getData());
}

/* Cancellazione di uno sconto */
async function deleteDiscount(req, res) {
    try {
        await DiscountModel.findByIdAndDelete(req.params.id);
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.sendStatus(utils.http.NO_CONTENT);
}

module.exports = {
    get: getDiscounts,
    add: addDiscount,
    delete: deleteDiscount
}