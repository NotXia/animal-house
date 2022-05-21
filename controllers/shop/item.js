require('dotenv').config();

const mongoose = require("mongoose");
const ItemModel = require("../../models/shop/item");
const ProductModel = require("../../models/shop/product");

const { nanoid } = require("nanoid");
const validator = require("express-validator");
const path = require("path");
const fs = require("fs");


async function createItem(req, res) {
    let new_item_id;
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();

        const to_insert_item = validator.matchedData(req);
        const to_insert_products = to_insert_item.products;

        // Inserimento dei singoli prodotti
        const products = await ProductModel.insertMany(to_insert_products);
        const products_id = products.map((product) => product._id);
    
        // Composizione dell'item da inserire
        delete to_insert_item.products;
        to_insert_item.products_id = products_id;
    
        const new_item = await new ItemModel(to_insert_item).save();
        new_item_id = new_item.id;

        await session.commitTransaction();
        session.endSession();
    }
    catch (err) {
        await session.abortTransaction();
        session.endSession();
        // TODO Gestire errore di chiavi duplicate
        return res.sendStatus(500);
    }

    return res.status(200).send({ id: new_item_id });
}

async function createUploadImages(req, res) {
    try {
        // Ricerca dell'id del prodotto
        const item = await ItemModel.findById(req.params.item_id, {products_id: 1}).exec();
        if (!item) { return res.sendStatus(404); }
        const product_id = item.products_id[parseInt(req.params.product_index)];
        if (!product_id) { return res.sendStatus(404); }
    
        // Salvataggio dei file nel FS
        let filenames = []
        for (const [key, file] of Object.entries(req.files)) {
            const filename = `${nanoid(process.env.IMAGES_NAME_LENGTH)}${path.extname(file.name)}`;
            filenames.push(filename);

            await file.mv(`${process.env.SHOP_IMAGES_DIR_ABS_PATH}/${filename}`);
        }

        await ProductModel.findByIdAndUpdate(product_id, { $push: { images_path: { $each: filenames } } });
    }
    catch(err) {
        return res.sendStatus(500);
    }

    return res.sendStatus(200);
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
            min_price: { $min: "$products.price" }, // Il prezzo che rappresenta l'item è quello più piccolo tra i suoi prodotti
            product_number: { $size: "$products" },
            image_path: { // L'immagine associata ad un item è la prima del primo prodotto
                $first: {
                    $getField: { field: "images_path", input: { $first: "$products" } }
                }
            }
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
    let item = undefined; // Conterrà il risultato della ricerca

    try {
        // Cerca il prodotto associato al barcode e poi l'item che contiene il prodotto
        const product = await ProductModel.findOne({ barcode: req.params.barcode }).exec();
        if (product) {
            item = await ItemModel.findOne({ products_id: product._id }).populate("products_id").exec();
        }
    }
    catch(err) {
        return res.sendStatus(500); 
    }
    
    if (!item) { return res.sendStatus(404); }
    return res.status(200).send(item);
}

async function searchProducts(req, res) {
    let products = []; // Conterrà il risultato della ricerca

    try {
        const item = await ItemModel.findById(req.params.item_id).populate("products_id", "-__v").exec();
        if (item) {
            products = item.products_id;
        }
    }
    catch (err) {
        return res.sendStatus(500);
    }

    if (products.length === 0) { return res.sendStatus(404); }
    return res.status(200).send(products);
}

async function updateItemById(req, res) {
    const updated_fields = validator.matchedData(req, { locations: ["body"] });

    const updated_item = await ItemModel.findByIdAndUpdate(req.params.item_id, updated_fields, { new: true }).catch(function (err) {
        return res.sendStatus(500);
    });
    if (!updated_item) { return res.sendStatus(404); }

    return res.status(200).send(updated_item);
}

async function updateProductByIndex(req, res) {
    const updated_fields = validator.matchedData(req, { locations: ["body"] });

    // Estrazione del prodotto a partire dall'item
    const item = await ItemModel.findById(req.params.item_id, { "products_id": 1 }).exec();
    if (!item || !item.products_id[parseInt(req.params.product_index)]) { return res.sendStatus(404); }

    const updated_product = await ProductModel.findByIdAndUpdate(item.products_id[parseInt(req.params.product_index)], updated_fields, { new: true });

    return res.status(200).send(updated_product);
}

async function deleteItemById(req, res) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Estrazione dei prodotti associati all'item
        const to_delete_item = await ItemModel.findById(req.params.item_id, { products_id: 1 }).exec();
        if (!to_delete_item) { return res.sendStatus(404); }

        // Rimozione delle immagini associate ai prodotti
        const products = await ProductModel.find({ _id: { $in: to_delete_item.products_id } }, { images_path: 1 }).exec();
        for (const product of products) {
            for (const image of product.images_path) {
                await fs.promises.rm(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, image));
            }
        }

        // Rimozione dei prodotti e dell'item
        await ProductModel.deleteMany({ _id: { $in: to_delete_item.products_id } });
        await ItemModel.findByIdAndDelete(req.params.item_id);

        await session.commitTransaction();
        session.endSession();
    }
    catch (err) {
        await session.abortTransaction();
        session.endSession();
        // TODO Gestire errore di chiavi duplicate
        return res.sendStatus(500);
    }

    return res.sendStatus(200);
}

async function deleteProductByIndex(req, res) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Estrazione del prodotto
        const item = await ItemModel.findById(req.params.item_id, { products_id: 1 }).exec();
        if (!item || !item.products_id[parseInt(req.params.product_index)]) { return res.sendStatus(404); }

        // Rimozione delle immagini associate al prodotti
        const to_delete_product = await ProductModel.findById(item.products_id[parseInt(req.params.product_index)], { images_path: 1 }).exec();
        for (const image of to_delete_product.images_path) {
            await fs.promises.rm(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, image));
        }

        // Rimozione dei prodotti e dell'item
        await ProductModel.findByIdAndDelete(to_delete_product._id);
        await ItemModel.findByIdAndUpdate(req.params.item_id, { $pull: { products_id: to_delete_product._id } });

        await session.commitTransaction();
        session.endSession();
    }
    catch (err) {
        await session.abortTransaction();
        session.endSession();
        // TODO Gestire errore di chiavi duplicate
        return res.sendStatus(500);
    }

    return res.sendStatus(200);
}

async function deleteImageByIndex(req, res) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Estrazione del prodotto
        const item = await ItemModel.findById(req.params.item_id, { products_id: 1 }).exec();
        if (!item || !item.products_id[parseInt(req.params.product_index)]) { return res.sendStatus(404); }
        const product = await ProductModel.findById(item.products_id[parseInt(req.params.product_index)], { images_path: 1 }).exec();
        if (!product || !product.images_path[parseInt(req.params.image_index)]) { return res.sendStatus(404); }

        const to_delete_image = product.images_path[parseInt(req.params.image_index)];

        await fs.promises.rm(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, to_delete_image));
        await ProductModel.findByIdAndUpdate(product._id, { $pull: { images_path: to_delete_image } });

        await session.commitTransaction();
        session.endSession();
    }
    catch (err) {
        await session.abortTransaction();
        session.endSession();
        // TODO Gestire errore di chiavi duplicate
        return res.sendStatus(500);
    }

    return res.sendStatus(200);
}


module.exports = {
    create: createItem,
    createUploadImages: createUploadImages,
    search: searchItem,
    searchByBarcode: searchItemByBarcode,
    searchProducts: searchProducts,
    updateItem: updateItemById,
    updateProduct: updateProductByIndex,
    deleteItem: deleteItemById,
    deleteProduct: deleteProductByIndex,
    deleteImage: deleteImageByIndex
}