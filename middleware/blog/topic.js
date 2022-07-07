const validator = require("../validators/post");
const { REQUIRED, OPTIONAL } = require("../validators/utils");
const utils = require("../utils");

const validateInsertTopic = [
    validator.validateTopicName("body", REQUIRED, "name"),
    validator.validateTopicIcon("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateUpdateTopic = [
    validator.validateTopicName("param", REQUIRED),
    validator.validateTopicName("body", OPTIONAL, "name"),
    validator.validateTopicIcon("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateDeleteTopic = [
    validator.validateTopicName("param", REQUIRED),
    utils.validatorErrorHandler
];

module.exports = {
    validateInsertTopic: validateInsertTopic,
    validateUpdateTopic: validateUpdateTopic,
    validateDeleteTopic: validateDeleteTopic
}