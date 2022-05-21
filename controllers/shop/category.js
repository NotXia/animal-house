require('dotenv').config();

const CategoryModel = require("../../models/shop/category");
const validator = require("express-validator");


async function createCategory(req, res) {

}

async function searchCategory(req, res) {

}

async function updateCategory(req, res) {

}

async function deleteCategory(req, res) {

}


module.exports = {
    create: createCategory,
    search: searchCategory,
    update: updateCategory,
    delete: deleteCategory
}