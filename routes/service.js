const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const service_middleware = require("../middleware/service");
const service_controller = require("../controllers/service");

// Router per i servizi
router.post("/", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), service_middleware.validateInsertService ], service_controller.insertService);

router.get("/", service_controller.getServices);
router.get("/:service_id", service_middleware.validateGetServiceById, service_controller.getServiceById);

router.put("/:service_id", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), service_middleware.validateUpdateService ], service_controller.updateService);

router.delete("/:service_id", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), service_middleware.validateDeleteService ], service_controller.deleteService);

module.exports = router;