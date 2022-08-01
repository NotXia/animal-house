const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const user_middleware = require("../middleware/user");
const user_controller = require("../controllers/user");
const operator_middleware = require("../middleware/user.operator");
const operator_controller = require("../controllers/user.operator");

/* Operazioni sull'utenza dei clienti */
router.post("/customers/", [ user_middleware.validateInsertCustomer ], user_controller.insertCustomer);
router.get("/customers/:username", [ auth_middleware([ ["user"] ], [ ["admin"] ]), user_middleware.validateSearchUser ], user_controller.searchUser(is_operator=false));
router.put("/customers/:username", [ auth_middleware([ ["user"]] , [ ["admin"] ]), user_middleware.validateUpdateCustomer ], user_controller.updateUser(is_operator=false));
router.delete("/customers/:username", [ auth_middleware([ ["user"] ], [ ["admin"] ]), user_middleware.validateDeleteUser ], user_controller.deleteUser(is_operator=false));


/* Operazioni sull'utenza degli operatori */
router.post("/operators/", [ auth_middleware([], [ ["admin"] ]), user_middleware.validateInsertOperator ], user_controller.insertOperator);
router.get("/operators/:username", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), user_middleware.validateSearchUser ], user_controller.searchUser(is_operator=true));
router.put("/operators/:username", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), user_middleware.validateUpdateOperator ], user_controller.updateUser(is_operator=true));
router.delete("/operators/:username", [ auth_middleware([], [ ["admin"] ]), user_middleware.validateDeleteUser ], user_controller.deleteUser(is_operator=true));

/* Operazioni sulle assenze degli operatori */
router.post("/operators/:username/absences/", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), operator_middleware.validateInsertAbsenceTime ], operator_controller.insertAbsenceTime);
router.get("/operators/:username/absences/", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), operator_middleware.validateGetAbsenceTime ], operator_controller.getAbsenceTime);
router.delete("/operators/:username/absences/:absence_time_index", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), operator_middleware.validateDeleteAbsenceTimeByIndex ], operator_controller.deleteAbsenceTimeByIndex);

/* Operazioni sull'orario lavorativo degli operatori */
router.get("/operators/:username/working-time/", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), operator_middleware.validateGetWorkingTime ], operator_controller.getWorkingTime);
router.put("/operators/:username/working-time/", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), operator_middleware.validateUpdateWorkingTime ], operator_controller.updateWorkingTime);

/* Operazioni sulle disponibilità degli operatori */
router.get("/operators/:username/availabilities/", operator_middleware.validateGetAvailabilities, operator_controller.getAvailabilities);


/* Operazioni profilo degli utenti */
router.get("/profiles/:username", user_middleware.validateSearchUserProfile, user_controller.searchUserProfile);

module.exports = router;