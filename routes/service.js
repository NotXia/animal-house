const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const service_middleware = require("../middleware/service");
const service_controller = require("../controllers/service");

// Router per i servizi
router.post("/", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), service_middleware.validateInsertService ], service_controller.insertService);

router.get("/", service_controller.getServices);
router.get("/:name", service_middleware.validateGetServiceByName, service_controller.getServiceByName);

router.put("/:name", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), service_middleware.validateUpdateService ], service_controller.updateService);


module.exports = router;