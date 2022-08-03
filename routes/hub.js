const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const hub_middleware = require("../middleware/hub");
const hub_controller = require("../controllers/hub");

// Router per gli hub
router.post("/", [ auth_middleware([], [ ["admin"] ]), hub_middleware.validateInsertHub ], hub_controller.insertHub);

router.get("/", hub_middleware.validateGetHubs, hub_controller.getHubs);
router.get("/:code", hub_middleware.validateGetHubByCode, hub_controller.getHubByCode);

router.put("/:code", [ auth_middleware([], [ ["admin"] ]), hub_middleware.validateUpdateHub ], hub_controller.updateHub);

router.delete("/:code", [ auth_middleware([], [ ["admin"] ]), hub_middleware.validateDeleteHub ], hub_controller.deleteHub);

module.exports = router;