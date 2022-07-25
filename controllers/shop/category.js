require('dotenv').config();
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
        if (err.code == utils.MONGO_DUPLICATED_KEY) { err = error.generate.CONFLICT({ field: "name", message: "Esiste già una categoria con il nome inserito" }); }
        return error.response(err, res);
    }

    return res.sendStatus(utils.http.CREATED);
}

/* Lista di tutte le categorie */
async function getCategories(req, res) {
    let categories;

    try {
        categories = await CategoryModel.find({}, { _id: 0 }).exec();
        if (categories.length === 0) { throw error.generate.NOT_FOUND("Non ci sono categorie"); }
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(categories);
}

/* Aggiornamento di una categoria */
async function updateCategory(req, res) {
    const to_change_category = req.params.category;
    const updated_data = validator.matchedData(req, { locations: ["body"] });

    try {
        const updated_category = await CategoryModel.findOneAndUpdate({ name: to_change_category }, updated_data).exec();
        if (!updated_category) { throw error.generate.NOT_FOUND("Categoria inesistente"); }
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.sendStatus(utils.http.OK);
}

/* Cancellazione di una categoria */
async function deleteCategory(req, res) {
    const to_delete_category = req.params.category;

    try {
        const deleted_category = await CategoryModel.findOneAndDelete({ name: to_delete_category }).exec();
        if (!deleted_category) { throw error.generate.NOT_FOUND("Categoria inesistente"); }
    }
    catch (err) {
        return error.response(err, res);
    }
    
    return res.sendStatus(utils.http.OK);
}

module.exports = {
    create: insertCategory,
    getAll: getCategories,
    update: updateCategory,
    delete: deleteCategory
}