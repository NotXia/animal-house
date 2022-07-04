function handleRequired(validator_obj, required) {
    if (required) { return validator_obj.exists().withMessage("Valore mancante"); }
    else { return validator_obj.optional(); }
}

module.exports = {
    handleRequired: handleRequired
}