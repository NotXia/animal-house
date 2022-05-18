require('dotenv').config();
const CategoryModel = require("../models/shop/category");
const ItemModel = require("../models/shop/item");
const ProductModel = require("../models/shop/product");


async function createItem(req, res) {

}

async function searchItem(req, res) {
    let items = []; // Conterrà il risultato della ricerca
    let query = {};

    // Composizione della query
    if (req.query.category_id) { query.category_id = req.query.category_id; }
    if (req.query.name) { query.name = req.query.name; }

    try {
        const query_obj = ItemModel.find(query)
                            .limit(req.query.page_size)
                            .skip(req.query.page_number);
        items = await query_obj.exec();
    }
    catch (err) {
        return res.sendStatus(500);
    }

    if (items.length === 0) { return res.sendStatus(404); }
    return res.status(200).send(items);
}

async function searchItemByBarcode(req, res) {
    let item; // Conterrà il risultato della ricerca

    try {
        const product = await ProductModel.findOne({ barcode: req.params.barcode }).exec();
        item = await ItemModel.find({ products_id: product._id }).exec();
    }
    catch(err) { 
        return res.sendStatus(500); 
    }
    
    if (!item) { res.sendStatus(404); }
    return res.status(200).send(item);
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