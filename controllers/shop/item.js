require('dotenv').config();

const ItemModel = require("../../models/shop/item");
const CategoryModel = require("../../models/shop/category");
const SpeciesModel = require("../../models/animals/species");

const validator = require("express-validator");
const path = require("path");
const utils = require("../../utilities");
const error = require("../../error_handler");
const file_controller = require('../file');

async function checkCategoryExists(category_name) {
    if (!await CategoryModel.findByName(category_name)) { 
        throw error.generate.NOT_FOUND("Categoria inesistente"); 
    }
    return true;
}

async function checkSpeciesExists(species_name) {
    if (!await SpeciesModel.findByName(species_name)) { 
        throw error.generate.NOT_FOUND("Specie inesistente"); 
    }
    return true;
}

async function checkBarcodeUniqueness(barcode, to_ignore_item_id) {
    let query = {};
    query["products.barcode"] = barcode;
    if (to_ignore_item_id) { query["_id"] = {"$ne": to_ignore_item_id}; }

    if (await ItemModel.findOne(query)) {
        throw error.generate.CONFLICT({ field: "barcode", message: "Il prodotto associato al barcode è già presente in un item" }); 
    }
    return true;
}

/* 
    Gestisce la creazione di un nuovo item comprensivo di prodotti 
*/
async function createItem(req, res) {
    let new_item;
    const to_insert_item = validator.matchedData(req);

    try {
        // Verifica esistenza categoria e specie target
        await checkCategoryExists(to_insert_item.category);
        for (const product of to_insert_item.products) {
            if (product.target_species) {
                for (const species of product.target_species) { await checkSpeciesExists(species); }
            }
        }

        // Verifica unicità barcode
        let local_barcodes = {};
        for (const product of to_insert_item.products) {
            await checkBarcodeUniqueness(product.barcode, null); // Verifica collisioni tra item

            // Verifica collisioni nello stesso item
            if (local_barcodes[product.barcode]) { throw error.generate.CONFLICT({ field: "barcode", message: "Sono presenti stessi barcode nello stesso item" }); }
            local_barcodes[product.barcode] = true;
        }

        // Reclamo immagini
        for (const product of to_insert_item.products) {
            if (!product.images) { continue; }
            const product_images_name = product.images.map((image) => image.path);
            await file_controller.utils.claim(product_images_name, process.env.SHOP_IMAGES_DIR_ABS_PATH);
        }

        // Inserimento dell'item
        new_item = await new ItemModel(to_insert_item).save();
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.CREATED).location(`${req.baseUrl}/items/${new_item._id}`).json(new_item.getData());
}

/*
    Gestisce la ricerca di item secondo criteri vari
*/
async function searchItem(req, res) {
    let items = [];
    let query_criteria = {};
    let sort_criteria = { "relevance": -1 };

    // Composizione della query
    if (req.query.category) { query_criteria.category = category; } // Non c'è bisogno di controllare l'esistenza
    if (req.query.name) { query_criteria.name = `/${req.query.name}/`; }
    
    // Determina il criterio di ordinamento
    if (req.query.price_asc) { sort_criteria = { "min_price": 1 }; }
    if (req.query.price_desc) { sort_criteria = { "max_price": -1 }; }
    if (req.query.name_asc) { sort_criteria = { "name": 1 }; }
    if (req.query.name_desc) { sort_criteria = { "name": -1 }; }

    try {
        items = await ItemModel.aggregate([
            { $match: query_criteria },
            { $addFields: {
                min_price: { $min: "$products.price" },
                max_price: { $max: "$products.price" },
            }},
            { $sort: sort_criteria },
            { $skip: parseInt(req.query.page_number) }, // Per paginazione
            { $limit: parseInt(req.query.page_size) },
        ]);

        items = items.map(item => (new ItemModel(item)).getData()); // Conversione del risultato nel formato corretto
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(items);
}

/*
    Gestisce la ricerca di item usando il barcode di uno dei prodotti associati
*/
async function searchItemByBarcode(req, res) {
    let item = undefined; // Conterrà il risultato della ricerca

    try {
        item = await ItemModel.findOne({ "products.barcode": req.params.barcode }).exec();
        if (!item) { throw error.generate.NOT_FOUND("Nessun item associato al barcode"); }
    }
    catch (err) {
        return error.response(err, res);
    }
    
    return res.status(utils.http.OK).json(item.getData());
}

/*
    Gestisce la ricerca di tutti i prodotti associati ad un item
*/
async function searchSingleItem(req, res) {
    let out_item;

    try {
        out_item = await ItemModel.findById(req.params.item_id).exec();
        if (!out_item) { throw error.generate.NOT_FOUND("Item inesistente"); }
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(out_item.getData());
}

/*
    Aggiorna i dati di un item
*/
async function updateItemById(req, res) {
    const updated_fields = validator.matchedData(req, { locations: ["body"] });
    let updated_item = undefined;

    // Verifica esistenza categoria e specie
    if (updated_fields.category) { await checkCategoryExists(updated_fields.category); }
    if (updated_fields.products) {
        for (const product of updated_fields.products) {
            if (product.target_species) {
                for (const species of product.target_species) { await checkSpeciesExists(species); }
            }
        }
    }

    try {
        item = await ItemModel.findById(req.params.item_id);
        if (!item) { throw error.generate.NOT_FOUND("Item inesistente"); }

        if (updated_fields.products) {
            // -- Gestione unicità barcode --
            let local_barcodes = {};
            for (const product of updated_fields.products) {
                await checkBarcodeUniqueness(product.barcode, item.id); // Verifica collisioni tra altri item

                // Verifica collisioni nello stesso item
                if (local_barcodes[product.barcode]) { throw error.generate.CONFLICT({ field: "barcode", message: "Sono presenti stessi barcode nello stesso item" }); }
                local_barcodes[product.barcode] = true;
            }

            // Normalizzazione path immagini
            for (let product of updated_fields.products) {
                product.images = product.images?.map((image) => ({ path: path.basename(image.path), description: image.description}));
            }
            
            // -- Gestione immagini --
            let old_images = item.products.map(          (product) => product.images?.map((image) => path.basename(image.path)) ).flat(); // Estrazione path immagini attuali
            let new_images = updated_fields.products.map((product) => product.images?.map((image) => path.basename(image.path)) ).flat(); // Estrazione path immagini attuali
            // Gestione delle immagini cambiate
            const images_changes = file_controller.utils.diff(old_images, new_images);
            await file_controller.utils.claim(images_changes.added, process.env.SHOP_IMAGES_DIR_ABS_PATH);
            await file_controller.utils.delete(images_changes.removed, process.env.SHOP_IMAGES_DIR_ABS_PATH);
        }

        for (const [field, value] of Object.entries(updated_fields)) { item[field] = value; }

        await item.save();
        updated_item = item;
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(updated_item.getData());
}

/* 
    Gestisce la cancellazione di un item
*/
async function deleteItemById(req, res) {
    try {
        // Estrazione dei prodotti associati all'item
        const to_delete_item = await ItemModel.findById(req.params.item_id).exec();
        if (!to_delete_item) { throw error.generate.NOT_FOUND("Item inesistente"); }

        // Rimozione delle immagini associate ai prodotti
        for (const product of to_delete_item.products) {
            if (!product.images) { continue; }
            const to_delete_images = product.images.map((image) => path.basename(image.path));
            await file_controller.utils.delete(to_delete_images, process.env.SHOP_IMAGES_DIR_ABS_PATH);
        }

        // Rimozione dell'item
        await ItemModel.findByIdAndDelete(req.params.item_id);
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.sendStatus(utils.http.NO_CONTENT);
}

module.exports = {
    create: createItem,
    search: searchItem,
    searchByBarcode: searchItemByBarcode,
    searchItem: searchSingleItem,
    updateItem: updateItemById,
    deleteItem: deleteItemById
}