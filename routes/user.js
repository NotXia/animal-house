const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const user_middleware = require("../middleware/user");
const user_controller = require("../controllers/user");
const operator_middleware = require("../middleware/user.operator");
const operator_controller = require("../controllers/user.operator");

router.post("/customers/", [ user_middleware.validateInsertCustomer ], user_controller.insertCustomer);
router.get("/customers/:username", [ auth_middleware([ ["user"] ], [ ["admin"] ]), user_middleware.validateSearchUser ], user_controller.searchUser(all=true));
router.put("/customers/:username", [ auth_middleware([ ["user"]] , [ ["admin"] ]), user_middleware.validateUpdateCustomer ], user_controller.updateUser(is_operator=false));
router.delete("/customers/:username", [ auth_middleware([ ["user"] ], [ ["admin"] ]), user_middleware.validateDeleteUser ], user_controller.deleteUser(is_operator=false));

router.post("/operators/", [ auth_middleware([], [ ["admin"] ]), user_middleware.validateInsertOperator ], user_controller.insertOperator);
router.get("/operators/:username", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), user_middleware.validateSearchUser ], user_controller.searchUser(is_operator=true));
router.put("/operators/:username", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), user_middleware.validateUpdateOperator ], user_controller.updateUser(is_operator=true));
router.delete("/operators/:username", [ auth_middleware([], [ ["admin"] ]), user_middleware.validateDeleteUser ], user_controller.deleteUser(all=true));

router.post("/operators/:username/absences/", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), operator_middleware.validateInsertAbsenceTime ], operator_controller.insertAbsenceTime);
router.get("/operators/:username/absences/", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), operator_middleware.validategetAbsenceTime ], operator_controller.getAbsenceTime);
router.delete("/operators/:username/absences/:absence_time_index", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), operator_middleware.validateDeleteAbsenceTimeByIndex ], operator_controller.deleteAbsenceTimeByIndex);


router.get("/profiles/:username", user_middleware.validateSearchUserProfile, user_controller.searchUser(all=false));

module.exports = router;