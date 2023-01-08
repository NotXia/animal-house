const validator = require("express-validator");
const { REQUIRED } = require("./utils");
const utils = require("./utils");
const error = require("../../error_handler");
const OrderModel = require("../../models/shop/order");

/* Item */
module.exports.validateItemName = (source, required=true, field_name="name") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim(); }
module.exports.validateItemDescription = (source, required=true, field_name="description") => { return utils.handleRequired(validator[source](field_name), required).trim(); }
module.exports.validateItemRelevance = (source, required=true, field_name="relevance") => { return utils.handleRequired(validator[source](field_name), required, 0).isInt().withMessage("Formato non valido"); }
module.exports.validateItemId = (source, required=true, field_name="item_id") => { return utils.handleRequired(validator[source](field_name), required).isMongoId().withMessage("Formato non valido"); }

/* Prodotti */
module.exports.validateProductName = module.exports.validateItemName;
module.exports.validateProductDescription = module.exports.validateItemDescription;
module.exports.validateProductBarcode = (source, required=true, field_name="barcode") => { return utils.handleRequired(validator[source](field_name), required).trim(); }
module.exports.validateProductIndex = (source, required=true, field_name="product_index") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Formato non valido"); }
module.exports.validateProductPrice = (source, required=true, field_name="price") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Formato non valido"); }
module.exports.validateProductQuantity = (source, required=true, field_name="quantity") => { return utils.handleRequired(validator[source](field_name), required, 0).isInt({ min: 0 }).withMessage("Formato non valido"); }
module.exports.validateProductTargetSpecies = (source, required = true, field_name = "target_species.*") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim(); }
module.exports.validateProductImages = function (source, required=true, field_name="images") { 
    return [
        utils.handleRequired(validator[source](field_name), required).isArray().withMessage("Formato non valido"),
        utils.handleRequired(validator[source](`${field_name}.*.path`), required=true).notEmpty().withMessage("Valore mancante").trim(),
        utils.handleRequired(validator[source](`${field_name}.*.description`), required=true).withMessage("Valore mancante").trim()
    ]; 
}

module.exports.validateListOfProducts = function (source, required=true, field_name="products") {
    let validation = [];

    if (required) { validation.push( utils.handleRequired(validator[source](`${field_name}`)).isArray({ min: 1 }).withMessage("Nessun prodotto inserito") ); }
    else { validation.push(utils.handleRequired(validator[source](`${field_name}`)) ); }
    
    return validation.concat([
        module.exports.validateProductBarcode(source, utils.REQUIRED, `${field_name}.*.barcode`),
        module.exports.validateProductName(source, utils.REQUIRED, `${field_name}.*.name`),
        module.exports.validateProductDescription(source, utils.OPTIONAL, `${field_name}.*.description`),
        module.exports.validateProductPrice(source, utils.REQUIRED, `${field_name}.*.price`),
        module.exports.validateProductQuantity(source, utils.REQUIRED, `${field_name}.*.quantity`),
        module.exports.validateProductTargetSpecies(source, utils.OPTIONAL, `${field_name}.*.target_species_id.*`),
        module.exports.validateProductImages(source, utils.OPTIONAL, `${field_name}.*.images`),
    ]);
}

/* Categorie */
module.exports.validateCategoryName = (source, required=true, field_name="name") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim(); }
module.exports.validateCategoryIcon = (source, required=true, field_name="icon") => { return utils.handleRequired(validator[source](field_name), required).isBase64().withMessage("Formato non valido"); }

/* Ordini */
module.exports.validateOrderId = (source, required=true, field_name="order_id") => { return utils.handleRequired(validator[source](field_name), required).isMongoId().withMessage("Formato non valido"); }
module.exports.validateOrderPickupFlag = (source, required=true, field_name="pickup") => { return utils.handleRequired(validator[source](field_name), required).isBoolean().withMessage("Valore mancante"); }
module.exports.validateOrderStatus = (source, required=true, field_name="status") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim().isIn(OrderModel.STATUSES).withMessage("Valore invalido"); }
module.exports.validateOrderTrackingCode = (source, required=true, field_name="tracking") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().withMessage("Valore mancante").trim(); }
module.exports.validateOrderProductsList = function (source, required=true, field_name="products") {
    return [
        utils.handleRequired(validator[source](field_name), required).isArray().withMessage("Formato errato"),
        module.exports.validateProductBarcode(source, REQUIRED, `${field_name}.*.barcode`),
        module.exports.validateProductQuantity(source, REQUIRED, `${field_name}.*.quantity`)
    ];
}

module.exports.verifyOrderOwnership = async function(order_id, username) {
    const order = await OrderModel.findById(order_id).exec();
    if (!order) { return error.generate.NOT_FOUND(); }

    if (order.customer !== username) { return error.generate.FORBIDDEN("Non autorizzato"); }
}