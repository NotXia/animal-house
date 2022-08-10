const utils = require("./utils");
const file_upload = require("express-fileupload");

const validateUploadImages = [
    file_upload(),
    utils.verifyImage
]

module.exports = {
    validateUploadImages: validateUploadImages
}