require('dotenv').config();
const CategoryModel = require("../models/shop/category");
const ItemModel = require("../models/shop/item");
const ProductModel = require("../models/shop/product");


async function createItem(req, res) {

}

async function searchItem(req, res) {
    let query_criteria = {};
    let sort_criteria = { "relevance": -1 }

    // Composizione della query
    if (req.query.category_id) { query_criteria.category_id = req.query.category_id; }
    if (req.query.name) { query_criteria.name = `/${req.query.name}/`; }
    
    if (req.query.price_asc) { sort_criteria = { "min_price": 1 }; }
    if (req.query.price_desc) { sort_criteria = { "min_price": -1 }; }
    if (req.query.name_asc) { sort_criteria = { "name": 1 }; }
    if (req.query.name_desc) { sort_criteria = { "name": -1 }; }

    const items = await ItemModel.aggregate([
        { $match: query_criteria },
        { $lookup: {
            from: ProductModel.collection.name,
            localField: "products_id",
            foreignField: "_id",
            as: "products"
        }},
        { $project: {
            name: 1,
            description: 1,
            min_price: { $min: "$products.price" },
            product_number: { $size: "$products" }
        }},
        { $sort: sort_criteria },
        { $skip: parseInt(req.query.page_number) },
        { $limit: parseInt(req.query.page_size) }
    ]).catch (function (err) {
        return res.sendStatus(500);
    });

    if (items.length === 0) { return res.sendStatus(404); }
    return res.status(200).send(items);
}

async function searchItemByBarcode(req, res) {
    let item; // Conterrà il risultato della ricerca

    try {
        // Cerca il prodotto associato al barcode e poi l'item che contiene il prodotto
        const product = await ProductModel.findOne({ barcode: req.params.barcode }).exec();
        item = await ItemModel.findOne({ products_id: product._id }).exec();
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