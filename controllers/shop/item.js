require('dotenv').config();

const ItemModel = require("../../models/shop/item");
const ProductModel = require("../../models/shop/product");
const CategoryModel = require("../../models/shop/category");
const SpeciesModel = require("../../models/animals/species");

const { nanoid } = require("nanoid");
const validator = require("express-validator");
const path = require("path");
const fs = require("fs");
const utils = require("../../utilities");
const error = require("../../error_handler");
const product = require('../../models/shop/product');

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

/* 
    Gestisce la creazione di un nuovo item comprensivo di prodotti 
*/
async function createItem(req, res) {
    let new_item;
    let products_id;
    const to_insert_item = validator.matchedData(req);
    const to_insert_products = to_insert_item.products;
    delete to_insert_item.products;

    try {
        // Verifica esistenza categoria e specie target
        checkCategoryExists(to_insert_item.category);
        for (const product of to_insert_products) {
            if (product.target_species) {
                for (const species of product.target_species) { checkSpeciesExists(species.name); }
            }
        }

        // Inserimento dei singoli prodotti
        const products = await ProductModel.insertMany(to_insert_products);
        products_id = products.map((product) => product._id);
        to_insert_item.products_id = products_id;

        // Inserimento dell'item
        new_item = await new ItemModel(to_insert_item).save();
    }
    catch (err) {
        if (err.code == utils.MONGO_DUPLICATED_KEY) {
            await ProductModel.deleteMany({ _id: products_id }).catch((err) => {}); // Rimuove tutti i prodotti dato che non verranno associati all'item
            err = error.generate.CONFLICT({ field: "barcode", message: "Il prodotto associato al barcode è già presente in un item" });
        }
        return error.response(err, res);
    }

    return res.status(utils.http.CREATED).location(`${req.baseUrl}/items/${new_item._id}`).json(await new_item.getData());
}

/*
    Gestisce la ricerca di item secondo criteri vari
*/
async function searchItem(req, res) {
    let items = [];
    let query_criteria = {};
    let sort_criteria = { "relevance": -1 };

    // Composizione della query
    if (req.query.category) {
        checkCategoryExists(to_insert_item.category);
        query_criteria.category = category; 
    }
    if (req.query.name) { query_criteria.name = `/${req.query.name}/`; }
    
    // Determina il criterio di ordinamento
    if (req.query.price_asc) { sort_criteria = { "min_price": 1 }; }
    if (req.query.price_desc) { sort_criteria = { "max_price": -1 }; }
    if (req.query.name_asc) { sort_criteria = { "name": 1 }; }
    if (req.query.name_desc) { sort_criteria = { "name": -1 }; }

    try {
        items = await ItemModel.aggregate([
            { $match: query_criteria },
            { $lookup: {
                    from: ProductModel.collection.name,
                    localField: "products_id",
                    foreignField: "_id",
                    as: "products"
            }},
            { $addFields: {
                    min_price: { $min: "$products.price" },
                    max_price: { $max: "$products.price" },
            }},
            { $sort: sort_criteria },
            { $skip: parseInt(req.query.page_number) }, // Per paginazione
            { $limit: parseInt(req.query.page_size) },
        ]);

        if (items.length === 0) { throw error.generate.NOT_FOUND("Nessun prodotto corrisponde ai criteri di ricerca"); }
        items = await Promise.all(items.map( async item => await (new ItemModel(item)).getData() )); // Conversione del risultato nel formato corretto
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
        // Cerca il prodotto associato al barcode e poi l'item che contiene il prodotto
        const product = await ProductModel.findOne({ barcode: req.params.barcode }).exec();
        if (product) { item = await ItemModel.findOne({ products_id: product._id }).exec(); }

        if (!item) { throw error.generate.NOT_FOUND("Nessun item associato al barcode"); }
    }
    catch (err) {
        return error.response(err, res);
    }
    
    return res.status(utils.http.OK).json(await item.getData());
}

/*
    Gestisce la ricerca di tutti i prodotti associati ad un item
*/
async function searchSingleItem(req, res) {
    let out_item;

    try {
        out_item = await ItemModel.findById(req.params.item_id).exec();
        if (!out_item) { throw error.generate.NOT_FOUND("Item inesistente"); }
        out_item = await out_item.getData();
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(out_item);
}

/*
    Aggiorna i dati generali (non dei singoli prodotti) di un item
*/
async function updateItemById(req, res) {
    const updated_fields = validator.matchedData(req, { locations: ["body"] });
    let updated_item = undefined;

    if (updated_fields.category) { checkCategoryExists(to_insert_item.category); }

    try {
        updated_item = await ItemModel.findByIdAndUpdate(req.params.item_id, updated_fields, { new: true });
        if (!updated_item) { throw error.generate.NOT_FOUND("Item inesistente"); }
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(await updated_item.getData());
}

/*
    Aggiorna i dati di un prodotto ricercandolo a partire dal suo item
*/
async function updateProductByIndex(req, res) {
    const updated_fields = validator.matchedData(req, { locations: ["body"] });
    let updated_product;

    try {
        if (updated_fields.target_species) {
            for (const species of product.target_species) { checkSpeciesExists(species.name); }
        }

        // Estrazione del prodotto a partire dall'item
        const item = await ItemModel.findById(req.params.item_id, { "products_id": 1 }).exec();
        if (!item) { throw error.generate.NOT_FOUND("Item inesistente"); }
        if (!item.products_id[parseInt(req.params.product_index)]) { throw error.generate.NOT_FOUND("Prodotto inesistente"); }
    
        updated_product = await ProductModel.findByIdAndUpdate(item.products_id[parseInt(req.params.product_index)], updated_fields, { new: true });
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(updated_product.getData());
}

/* 
    Gestisce la cancellazione di un item
*/
async function deleteItemById(req, res) {
    try {
        // Estrazione dei prodotti associati all'item
        const to_delete_item = await ItemModel.findById(req.params.item_id, { products_id: 1 }).exec();
        if (!to_delete_item) { throw error.generate.NOT_FOUND("Item inesistente"); }

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
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.sendStatus(utils.http.NO_CONTENT);
}

/* 
    Gestisce la cancellazione di un singolo prodotto associato ad un item
*/
async function deleteProductByIndex(req, res) {
    try {
        // Estrazione del prodotto
        const item = await ItemModel.findById(req.params.item_id, { products_id: 1 }).exec();
        if (!item) { throw error.generate.NOT_FOUND("Item inesistente"); }
        if (!item.products_id[parseInt(req.params.product_index)]) { throw error.generate.NOT_FOUND("Prodotto inesistente"); }
        if (item.products_id.length === 1) { 
            return res.status(utils.http.SEE_OTHER).location(`${req.baseUrl}/items/${req.params.item_id}`).json({message: "Per rimuovere questo prodotto bisogna rimuovere l'item"}) 
        }

        // Rimozione delle immagini associate al prodotti
        const to_delete_product = await ProductModel.findById(item.products_id[parseInt(req.params.product_index)], { images_path: 1 }).exec();
        for (const image of to_delete_product.images_path) {
            await fs.promises.rm(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, image));
        }

        // Rimozione dei prodotti e dell'item
        await ProductModel.findByIdAndDelete(to_delete_product._id);
        await ItemModel.findByIdAndUpdate(req.params.item_id, { $pull: { products_id: to_delete_product._id } });
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.sendStatus(utils.http.NO_CONTENT);
}


/* 
    Gestisce il caricamento e salvataggio di immagini associate ai prodotti 
*/
async function createUploadImages(req, res) {
    let updated_product = undefined;

    try {
        // Ricerca dell'id del prodotto
        const item = await ItemModel.findById(req.params.item_id, { products_id: 1 }).exec();
        if (!item) { throw error.generate.NOT_FOUND("Item inesistente"); }
        if (!item.products_id[parseInt(req.params.product_index)]) { throw error.generate.NOT_FOUND("Prodotto inesistente"); }

        const product_id = item.products_id[parseInt(req.params.product_index)];

        // Salvataggio dei file nel filesystem
        let files_name = []
        for (const [key, file] of Object.entries(req.files)) {
            const filename = `${nanoid(process.env.IMAGES_NAME_LENGTH)}${path.extname(file.name)}`;
            files_name.push(filename);

            await file.mv(`${process.env.SHOP_IMAGES_DIR_ABS_PATH}/${filename}`);
        }

        // Salvataggio dei nomi dei file nel database
        updated_product = await ProductModel.findByIdAndUpdate(product_id, { $push: { images_path: { $each: files_name } } }, { new: true });
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.status(utils.http.OK).json(updated_product.getData());
}

/*
    Gestisce la cancellazione di un'immagine di un prodotto, ricercando a partire dall'item associato
*/
async function deleteImageByIndex(req, res) {
    try {
        // Estrazione dell'item
        const item = await ItemModel.findById(req.params.item_id, { products_id: 1 }).exec();
        if (!item) { throw error.generate.NOT_FOUND("Item inesistente"); }
        if (!item.products_id[parseInt(req.params.product_index)]) { throw error.generate.NOT_FOUND("Prodotto inesistente"); }
        
        // Estrazione del prodotto
        const product = await ProductModel.findById(item.products_id[parseInt(req.params.product_index)], { images_path: 1 }).exec();
        if (!product) { throw error.generate.NOT_FOUND("Prodotto inesistente"); }
        if (!product.images_path[parseInt(req.params.image_index)]) { throw error.generate.NOT_FOUND("Immagine inesistente"); }

        // Determina l'immagine da cancellare
        const to_delete_image = product.images_path[parseInt(req.params.image_index)];

        // Cancella l'immagine dal filesystem e database
        await fs.promises.rm(path.join(process.env.SHOP_IMAGES_DIR_ABS_PATH, to_delete_image));
        await ProductModel.findByIdAndUpdate(product._id, { $pull: { images_path: to_delete_image } });
    }
    catch (err) {
        return error.response(err, res);
    }

    return res.sendStatus(utils.http.NO_CONTENT);
}


module.exports = {
    create: createItem,
    createUploadImages: createUploadImages,
    search: searchItem,
    searchByBarcode: searchItemByBarcode,
    searchItem: searchSingleItem,
    updateItem: updateItemById,
    updateProduct: updateProductByIndex,
    deleteItem: deleteItemById,
    deleteProduct: deleteProductByIndex,
    deleteImage: deleteImageByIndex
}