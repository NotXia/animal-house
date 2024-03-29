const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const user_middleware = require("../middleware/user");
const user_controller = require("../controllers/user");
const operator_middleware = require("../middleware/user.operator");
const operator_controller = require("../controllers/user.operator");
const animal_middleware = require("../middleware/animal");
const animal_controller = require("../controllers/animal");
const cart_middleware = require("../middleware/shop/cart");
const cart_controller = require("../controllers/shop/cart");
const customer_controller = require("../controllers/user.customer");

/* Operazioni sull'utenza dei clienti */
router.put("/customers/enable-me", auth_middleware([ ["to_activate_user"] ], []), user_controller.enableCustomer);
router.get("/customers/:username/verification-mail", user_middleware.validateSendVerificationMail, user_controller.sendVerificationMail);
router.post("/customers/", [ user_middleware.validateInsertCustomer ], user_controller.insertCustomer);
router.get("/customers/:username", [ auth_middleware([ ["customer"] ], [ ["admin"] ]), user_middleware.validateSearchUser ], user_controller.searchUser(is_operator=false));
router.put("/customers/:username", [ auth_middleware([ ["customer"] ] , [ ["admin"] ]), user_middleware.validateUpdateCustomer ], user_controller.updateUser(is_operator=false));
router.delete("/customers/:username", [ auth_middleware([ ["customer"] ], [ ["admin"] ]), user_middleware.validateDeleteUser ], user_controller.deleteUser(is_operator=false));

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


/* Controllo sulla disponibilità di uno username */
router.get("/usernames/available/:username", user_middleware.validateUsernameAvailability, user_controller.checkUsernameAvailability);
/* Controllo sulla disponibilità di una mail */
router.get("/emails/available/:email", user_middleware.validateEmailAvailability, user_controller.checkEmailAvailability);


/* Operazioni profilo degli utenti */
router.get("/profiles/:username", user_middleware.validateSearchUserProfile, user_controller.searchUserProfile);

/* Operazioni sugli animali */
router.post("/customers/:username/animals/", [ auth_middleware([ ["customer"], ["operator"] ], [ ["admin"] ]), animal_middleware.validateAddAnimal ], animal_controller.addAnimal);
router.get("/customers/:username/animals/", animal_middleware.validateGetAnimals, animal_controller.getAnimals)
router.put("/customers/:username/animals/", [ auth_middleware([ ["customer"] ], [ ["admin"], ["operator"] ]), animal_middleware.validateUpdateUserAnimals ], animal_controller.updateUserAnimals)

/* Operazioni sui permessi */
router.get("/permissions/", [ auth_middleware() ], user_controller.getPermissions);
router.get("/permissions/:permission_name", [ auth_middleware([ ["operator"] ], [ ["admin"] ]), user_middleware.validateSearchPermissionByName ], user_controller.getPermissionByName);

/* Operazioni sul carrello shop */
router.post("/customers/:username/cart/", [ auth_middleware([ ["customer"] ], [ ["admin"] ]), cart_middleware.validateAddToCart ], cart_controller.addToCart);
router.get("/customers/:username/cart/", [ auth_middleware([ ["customer"] ], [ ["admin"] ]), cart_middleware.validateGetCart ], cart_controller.getCart);
router.put("/customers/:username/cart/", [ auth_middleware([ ["customer"] ], [ ["admin"] ]), cart_middleware.validateUpdateCart ], cart_controller.updateCart);

router.post("/customers/vip/checkout", auth_middleware([ ["customer"] ], []), customer_controller.checkoutVIP);
router.post("/customers/vip/success", auth_middleware([ ["customer"] ], []), customer_controller.successVIP);
router.get("/customers/vip/price", customer_controller.priceVIP);

module.exports = router;
