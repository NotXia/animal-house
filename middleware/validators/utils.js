function handleRequired(validator_obj, required, default_value=undefined) {
    if (default_value != undefined) { validator_obj = validator_obj.customSanitizer(value => value || default_value); }
    if (required) { return validator_obj.exists().withMessage("Valore mancante"); }
    else { return validator_obj.optional(); }
}

module.exports = {
    REQUIRED: true,
    OPTIONAL: false,
    handleRequired: handleRequired
}