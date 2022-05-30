const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const user_middleware = require("../middleware/user");
const user_controller = require("../controllers/user");

router.post("/customers/", [ user_middleware.validateInsertCustomer ], user_controller.insertCustomer);
router.get("/customers/:username", [ auth_middleware([ ["user"], ["admin"] ]), user_middleware.validateSearchUser ], user_controller.searchUser(false));
router.put("/customers/:username", [ auth_middleware([ ["user"], ["admin"] ]), user_middleware.validateUpdateCustomer ], user_controller.updateUser(false));
router.delete("/customers/:username", [ auth_middleware([ ["user"], ["admin"] ]), user_middleware.validateDeleteUser ], user_controller.deleteUser(false));

router.post("/operators/", [ auth_middleware([ ["admin"] ]), user_middleware.validateInsertOperator ], user_controller.insertOperator);
router.get("/operators/:username", [ auth_middleware([ ["operator"], ["admin"] ]), user_middleware.validateSearchUser ], user_controller.searchUser(true));
router.put("/operators/:username", [ auth_middleware([ ["operator"], ["admin"] ]), user_middleware.validateUpdateOperator ], user_controller.updateUser(true));
router.delete("/operators/:username", [ auth_middleware([ ["admin"] ]), user_middleware.validateDeleteUser ], user_controller.deleteUser(true));

module.exports = router;