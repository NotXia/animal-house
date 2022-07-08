const validator = require("../validators/post");
const { REQUIRED, OPTIONAL } = require("../validators/utils");
const utils = require("../utils");

const validateInsertTopic = [
    validator.validateTopicName("body", REQUIRED),
    validator.validateTopicIcon("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateUpdateTopic = [
    validator.validateTopicName("param", REQUIRED, "topic"),
    validator.validateTopicName("body", OPTIONAL),
    validator.validateTopicIcon("body", OPTIONAL),
    utils.validatorErrorHandler
];

const validateDeleteTopic = [
    validator.validateTopicName("param", REQUIRED, "topic"),
    utils.validatorErrorHandler
];

module.exports = {
    validateInsertTopic: validateInsertTopic,
    validateUpdateTopic: validateUpdateTopic,
    validateDeleteTopic: validateDeleteTopic
}