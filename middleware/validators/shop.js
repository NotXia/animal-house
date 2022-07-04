const validator = require("express-validator");
const utils = require("./utils");

module.exports.validateItemName = (source, required=true, field_name="name") => { return utils.handleRequired(validator[source](field_name), required).notEmpty().trim().escape(); }
module.exports.validateItemDescription = (source, required=true, field_name="description") => { return utils.handleRequired(validator[source](field_name), required).trim().escape(); }
module.exports.validateItemCategoryId = (source, required=true, field_name="category_id") => { return utils.handleRequired(validator[source](field_name), required).isMongoId().withMessage("Formato non valido"); }
module.exports.validateItemId = (source, required=true, field_name="item_id") => { return utils.handleRequired(validator[source](field_name), required).isMongoId().withMessage("Formato non valido"); }

module.exports.validateProductName = module.exports.validateItemName;
module.exports.validateProductDescription = module.exports.validateItemDescription;
module.exports.validateProductBarcode = (source, required=true, field_name="barcode") => { return utils.handleRequired(validator[source](field_name), required).trim().escape(); }
module.exports.validateProductIndex = (source, required=true, field_name="product_index") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Formato non valido"); }
module.exports.validateProductPrice = (source, required=true, field_name="price") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Formato non valido"); }
module.exports.validateProductQuantity = (source, required=true, field_name="quantity") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Formato non valido"); }
module.exports.validateProductTargetSpeciesId = (source, required = true, field_name = "target_species_id.*") => { return utils.handleRequired(validator[source](field_name), required).isMongoId().withMessage("Formato non valido"); }
module.exports.validateProductImageIndex = (source, required=true, field_name="image_index") => { return utils.handleRequired(validator[source](field_name), required).isInt({ min: 0 }).withMessage("Il valore deve essere un intero che inizia da 0"); }

module.exports.validateListOfProducts = function (source, required=true, field_name="products") {
    if (required) {
        return [
            validator[source](`${field_name}`).exists().isArray({ min: 1 }).withMessage("Nessun prodotto inserito"),
            module.exports.validateProductBarcode(source, utils.REQUIRED, `${field_name}.*.barcode`),
            module.exports.validateProductName(source, utils.OPTIONAL, `${field_name}.*.name`),
            module.exports.validateProductDescription(source, utils.OPTIONAL, `${field_name}.*.description`),
            module.exports.validateProductPrice(source, utils.REQUIRED, `${field_name}.*.price`),
            module.exports.validateProductQuantity(source, utils.OPTIONAL, `${field_name}.*.quantity`),
            module.exports.validateProductTargetSpeciesId(source, utils.OPTIONAL, `${field_name}.*.target_species_id.*`),
        ];
    }
    else {
        return validator[source](`${field_name}`).optional();
    }
}