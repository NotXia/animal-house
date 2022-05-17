require('dotenv').config();
const CategoryModel = require("../models/shop/category");
const ItemModel = require("../models/shop/item");
const ProductModel = require("../models/shop/product");


async function createItem(req, res) {

}

async function searchItem(req, res) {

}

async function searchItemByBarcode(req, res) {

}

async function updateItemByBarcode(req, res) {

}

async function deleteItemByBarcode(req, res) {

}


async function createCategory(req, res) {

}

async function searchCategory(req, res) {

}

async function updateCategory(req, res) {

}

async function deleteCategory(req, res) {

}


module.exports = {
    item: {
        create: createItem,
        search: searchItem,
        searchByBarcode: searchItemByBarcode,
        update: updateItemByBarcode,
        delete: deleteItemByBarcode
    },
    category: {
        create: createCategory,
        search: searchCategory,
        update: updateCategory,
        delete: deleteCategory
    }
}