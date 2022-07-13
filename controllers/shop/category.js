require('dotenv').config();
const mongoose = require("mongoose");
const utils = require("../../utilities");
const error = require("../../error_handler");
const CategoryModel = require("../../models/shop/category");
const validator = require('express-validator');

/* Creazione di una nuova categoria */
async function insertCategory(req, res) {
    const category_data = validator.matchedData(req);

    try {
        await new CategoryModel(category_data).save();
    }
    catch (err) {
        if (err.code === utils.MONGO_DUPLICATED_KEY) { return res.status(utils.http.CONFLICT).json(error.formatMessage(utils.http.CONFLICT)); }
        return res.status(utils.http.INTERNAL_SERVER_ERROR).json(error.formatMessage(utils.http.INTERNAL_SERVER_ERROR));
    }
    return res.sendStatus(utils.http.CREATED);
}

/* Lista di tutte le categorie */
async function getCategories(req, res) {
    let categories;

    try {
        categories = await CategoryModel.find({}, { _id: 0 }).exec();
        if (categories.length === 0) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
    }
    catch (err) {
        return res.status(utils.http.INTERNAL_SERVER_ERROR).json(error.formatMessage(utils.http.INTERNAL_SERVER_ERROR));
    }
    return res.status(utils.http.OK).json(categories);
}

/* Aggiornamento di una categoria */
async function updateCategory(req, res) {
    const to_change_category = req.params.category;
    const updated_data = validator.matchedData(req, { locations: ["body"] });

    try {
        const updated_category = await CategoryModel.findOneAndUpdate({ name: to_change_category }, updated_data).exec();
        if (!updated_category) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
    }
    catch (err) {
        return res.status(utils.http.INTERNAL_SERVER_ERROR).json(error.formatMessage(utils.http.INTERNAL_SERVER_ERROR));
    }
    return res.sendStatus(utils.http.OK);
}

/* Cancellazione di una categoria */
async function deleteCategory(req, res) {
    const to_delete_category = req.params.category;

    try {
        const deleted_category = await CategoryModel.findOneAndDelete({ name: to_delete_category }).exec();
        if (!deleted_category) { return res.status(utils.http.NOT_FOUND).json(error.formatMessage(utils.http.NOT_FOUND)); }
    }
    catch (err) {
        return res.status(utils.http.INTERNAL_SERVER_ERROR).json(error.formatMessage(utils.http.INTERNAL_SERVER_ERROR));
    }
    return res.sendStatus(utils.http.OK);
}

module.exports = {
    create: insertCategory,
    getAll: getCategories,
    update: updateCategory,
    delete: deleteCategory
}