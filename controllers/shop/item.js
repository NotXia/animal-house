require('dotenv').config();

const mongoose = require("mongoose");
const ItemModel = require("../../models/shop/item");

const { nanoid } = require("nanoid");
const validator = require("express-validator");
const path = require("path");
const fs = require("fs");
const utils = require("../../utilities");

/* 
    Gestisce la creazione di un nuovo item comprensivo di prodotti 
*/
async function createItem(req, res) {
    const to_insert_item = validator.matchedData(req);
    let new_item;

    try {
        new_item = await new ItemModel(to_insert_item).save();
    }
    catch (err) {
        switch (err.code) {
            case utils.MONGO_DUPLICATED_KEY:
                return res.status(409).send({ field: "barcode", message: "Un barcode associato ad un prodotto è già presente in un item" });
            default:
                return res.sendStatus(500);
        }
    }

    return res.status(201).location(`${req.baseUrl}/items/${new_item.id}`).send({ id: new_item.id });
}

/*
    Gestisce la ricerca di item secondo criteri vari
*/
async function searchItem(req, res) {
    let query_criteria = {};
    let sort_criteria = { "relevance": -1 }

    // Composizione della query
    if (req.query.category_id) { query_criteria.category_id = req.query.category_id; }
    if (req.query.name) { query_criteria.name = `/${req.query.name}/`; }
    
    // Determina il criterio di ordinamento
    if (req.query.price_asc) { sort_criteria = { "min_price": 1 }; }
    if (req.query.price_desc) { sort_criteria = { "min_price": -1 }; }
    if (req.query.name_asc) { sort_criteria = { "name": 1 }; }
    if (req.query.name_desc) { sort_criteria = { "name": -1 }; }

    const items = await ItemModel.aggregate([
        { $match: query_criteria },
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
        { $skip: parseInt(req.query.page_number) }, // Per paginazione
        { $limit: parseInt(req.query.page_size) }
    ]).catch (function (err) {
        return res.sendStatus(500);
    });

    if (items.length === 0) { return res.sendStatus(404); }
    return res.status(200).send(items);
}

/*
    Gestisce la ricerca di item usando il barcode di uno dei prodotti associati
*/
async function searchItemByBarcode(req, res) {
    const item = await ItemModel.findOne({ "products.barcode": req.params.barcode }).exec().catch(function (err) {
        return res.sendStatus(500); 
    });
    
    if (!item) { return res.sendStatus(404); }
    return res.status(200).send(item);
}

/*
    Gestisce l'estrazione di tutti i prodotti associati ad un item
*/
async function searchProducts(req, res) {
    const item = await ItemModel.findById(req.params.item_id).exec().catch(function (err) {
        return res.sendStatus(500);
    });
    if (!item) { return res.sendStatus(404); }
    
    return res.status(200).send(item.products);
}

/*
    Aggiorna i dati generali (non dei singoli prodotti) di un item
*/
async function updateItemById(req, res) {
    const updated_fields = validator.matchedData(req, { locations: ["body"] });

    const updated_item = await ItemModel.findByIdAndUpdate(req.params.item_id, updated_fields, { new: true }).catch(function (err) {
        return res.sendStatus(500);
    });
    if (!updated_item) { return res.sendStatus(404); }

    return res.status(200).send(updated_item);
}

/*
    Aggiorna i dati di un prodotto ricercandolo a partire dal suo item
*/
async function updateProductByIndex(req, res) {
    const updated_fields = validator.matchedData(req, { locations: ["body"] });

    // Verifica esistenza ed estrazione prodotto  
    const item = await ItemModel.findById(req.params.item_id, { products: 1 }).exec();
    if (!item || !item.products[parseInt(req.params.product_index)]) { return res.sendStatus(404); }
    let product = item.products[parseInt(req.params.product_index)];

    // Aggiornamento prodotto localmente
    for (const [key, value] of Object.entries(updated_fields)) {
        product[key] = value;
    }

    // Aggiornamento nel database
    const updated_item = await ItemModel.findByIdAndUpdate(
        req.params.item_id, 
        { [`products.${req.params.product_index}`]: product }, 
        { new: true }
    ).exec().catch(function (err) {
        return res.sendStatus(500);
    });

    return res.status(200).send(updated_item.products[parseInt(req.params.product_index)]);
}

/* 
    Gestisce la cancellazione di un item
*/
async function deleteItemById(req, res) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        
        // Estrazione dei prodotti associati all'item
        const to_delete_item = await ItemModel.findById(req.params.item_id, { products: 1 }).exec();
        if (!to_delete_item) { return res.sendStatus(404); }

        // Rimozione delle immagini associate ai prodotti
        for (const product of to_delete_item.products) {
            for (const image of product.images_path) {
                await fs.promises.rm(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, image));
            }
        }

        // Rimozione dell'item
        await ItemModel.findByIdAndDelete(req.params.item_id);

        await session.commitTransaction();
        await session.endSession();
    }
    catch (err) {
        await session.abortTransaction();
        await session.endSession();

        return res.sendStatus(500);
    }

    return res.sendStatus(200);
}

/* 
    Gestisce la cancellazione di un singolo prodotto associato ad un item
*/
async function deleteProductByIndex(req, res) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Estrazione del prodotto e verifica esistenza
        const item = await ItemModel.findById(req.params.item_id, { products: 1 }).exec();
        if (!item || !item.products[parseInt(req.params.product_index)]) { return res.sendStatus(404); }
        if (item.products.length === 1) { 
            return res.status(303).location(`${req.baseUrl}/items/${req.params.item_id}`).send({message: "Per rimuovere questo prodotto bisogna rimuovere l'item"}) 
        }

        // Rimozione delle immagini associate al prodotto
        for (const image of item.products[parseInt(req.params.product_index)].images_path) {
            await fs.promises.rm(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, image));
        }

        // Rimozione del prodotto (workaround per eliminare un elemento per indice)
        await ItemModel.findByIdAndUpdate(req.params.item_id, { $unset: { [`products.${req.params.product_index}`]: 1 } });
        await ItemModel.findByIdAndUpdate(req.params.item_id, { $pull: { products: null } });

        await session.commitTransaction();
        await session.endSession();
    }
    catch (err) {
        await session.abortTransaction();
        await session.endSession();

        return res.sendStatus(500);
    }

    return res.sendStatus(200);
}


/* 
    Gestisce il caricamento e salvataggio di immagini associate ai prodotti 
*/
async function createUploadImages(req, res) {
    try {
        // Verifica esistenza
        const item = await ItemModel.findById(req.params.item_id, { products: 1 }).exec();
        if (!item || !item.products[parseInt(req.params.product_index)]) { return res.sendStatus(404); }

        // Salvataggio dei file nel file system
        let files_name = []
        for (const [_, file] of Object.entries(req.files)) {
            const filename = `${nanoid(process.env.IMAGES_NAME_LENGTH)}${path.extname(file.name)}`;
            files_name.push(filename);

            await file.mv(`${process.env.SHOP_IMAGES_DIR_ABS_PATH}/${filename}`);
        }

        // Salvataggio dei nomi dei file nel database
        await ItemModel.findByIdAndUpdate(req.params.item_id, { $push: { [`products.${req.params.product_index}.images_path`]: { $each: files_name } } });
    }
    catch (err) {
        return res.sendStatus(500);
    }

    return res.sendStatus(200);
}

/*
    Gestisce la cancellazione di un'immagine di un prodotto, ricercando a partire dall'item associato
*/
async function deleteImageByIndex(req, res) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Verifica esistenza ed estrazione del prodotto
        const item = await ItemModel.findById(req.params.item_id, { products: 1 }).exec();
        if (!item || !item.products[parseInt(req.params.product_index)]) { return res.sendStatus(404); }
        const product = item.products[parseInt(req.params.product_index)];

        // Determina l'immagine da cancellare
        const to_delete_image = product.images_path[parseInt(req.params.image_index)];

        // Cancella l'immagine dal file system e database
        await fs.promises.rm(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, to_delete_image));
        await ItemModel.findByIdAndUpdate(req.params.item_id, { $unset: { [`products.${req.params.product_index}.images_path.${req.params.image_index}`]: 1 } });
        await ItemModel.findByIdAndUpdate(req.params.item_id, { $pull: { [`products.${req.params.product_index}.images_path`]: null } });

        await session.commitTransaction();
        session.endSession();
    }
    catch (err) {
        await session.abortTransaction();
        session.endSession();
        
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