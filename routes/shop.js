const express = require('express');
const router = express.Router();

const shop_controller = {
    item: require("../controllers/shop/item"),
    category: require("../controllers/shop/category"),
    order: require("../controllers/shop/order"),
    discount: require("../controllers/shop/discount")
};
const shop_middleware = {
    item: require("../middleware/shop/item"),
    category: require("../middleware/shop/category"),
    order: require("../middleware/shop/order"),
    discount: require("../middleware/shop/discount")
};
const auth_middleware = require("../middleware/auth");


/* Crea un nuovo item con dei prodotti associati */
router.post("/items/", [ auth_middleware([ ["operator", "shop_write"] ], [ ["admin"] ]),  shop_middleware.item.validateCreate ], shop_controller.item.create);

/* Cerca determinati item dello shop paginandoli secondo un dato criterio */
router.get("/items/", [auth_middleware([], [], false), shop_middleware.item.validateSearch], shop_controller.item.search);

/* Cerca un item dello shop per barcode di uno dei prodotto associati */
router.get("/items/barcode/:barcode", [ auth_middleware([], [], false), shop_middleware.item.validateSearchByBarcode ], shop_controller.item.searchByBarcode);

/* Cerca un singolo item */
router.get("/items/:item_id", [auth_middleware([], [], false), shop_middleware.item.validateSearchItem], shop_controller.item.searchItem);

/* Modifica di un item */
router.put("/items/:item_id", [ auth_middleware([ ["operator", "shop_write"] ], [ ["admin"] ]), shop_middleware.item.validateUpdateItem ], shop_controller.item.updateItem);

/* Cancella un item e tutti i prodotti connessi */
router.delete("/items/:item_id", [ auth_middleware([ ["operator", "shop_write"] ], [ ["admin"] ]), shop_middleware.item.validateDeleteItem ], shop_controller.item.deleteItem);

/* Conta un nuovo click sull'item */
router.post("/items/:item_id/click", shop_middleware.item.validateItemClick, shop_controller.item.itemClick);


router.post("/categories/", [ auth_middleware([ ["operator", "shop_write"], ["admin"] ]), shop_middleware.category.validateCreate ], shop_controller.category.create);
router.get("/categories/", shop_controller.category.getAll);
router.put("/categories/:category", [ auth_middleware([ ["operator", "shop_write"], ["admin"] ]), shop_middleware.category.validateUpdate ], shop_controller.category.update);
router.delete("/categories/:category", [ auth_middleware([ ["operator", "shop_write"], ["admin"] ]), shop_middleware.category.validateDelete ], shop_controller.category.delete);


router.post("/orders/", [ auth_middleware([ ["customer"] ] , [ ["admin"] ]), shop_middleware.order.validateCreate ], shop_controller.order.create);
router.get("/orders/", [ auth_middleware([ ["customer"] ], [ ["admin"], ["operator", "warehouse"] ]), shop_middleware.order.validateSearch ], shop_controller.order.search);
router.get("/orders/:order_id", [ auth_middleware([ ["customer"] ], [ ["admin"], ["operator", "warehouse"] ]), shop_middleware.order.validateSearchById ], shop_controller.order.searchById);
router.put("/orders/:order_id", [ auth_middleware([], [ ["admin"], ["operator", "warehouse"] ]), shop_middleware.order.validateUpdate ], shop_controller.order.update);
router.delete("/orders/:order_id", [ auth_middleware([ ["customer"] ], [ ["admin"], ["operator", "warehouse"] ]), shop_middleware.order.validateRemove ], shop_controller.order.remove);

router.post("/orders/:order_id/checkout", [ auth_middleware([ ["customer"] ] , []), shop_middleware.order.validateCheckout ], shop_controller.order.checkout);
router.post("/orders/:order_id/success", shop_middleware.order.validateSuccess, shop_controller.order.success);


router.get("/products/:barcode/discounts/", shop_controller.discount.get);
router.post("/products/:barcode/discounts/", shop_middleware.discount.add, shop_controller.discount.add);
router.delete("/products/discounts/:id", shop_middleware.discount.delete, shop_controller.discount.delete);



module.exports = router;