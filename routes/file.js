const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const file_middleware = require("../middleware/file");
const file_controller = require("../controllers/file");


router.post("/images/", [ auth_middleware(), file_middleware.validateUploadImages ], file_controller.uploadImages);


module.exports = router;