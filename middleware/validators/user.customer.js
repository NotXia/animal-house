const validator = require("express-validator");
const utils = require("./utils");

module.exports.validateAddress = function (source, required=true, field_name="address") {
    if (required) {
        return [
            utils.handleRequired(validator[source](field_name), utils.REQUIRED),
            validator[source](`${field_name}.city`).exists().trim().escape(),
            validator[source](`${field_name}.street`).exists().trim().escape(),
            validator[source](`${field_name}.number`).exists().trim().escape(),
            validator[source](`${field_name}.postal_code`).exists().isPostalCode("any").withMessage("Formato non valido"),
        ];
    }
    else {
        return utils.handleRequired(validator[source](field_name), utils.OPTIONAL);
    }
}