const express = require('express');
const router = express.Router();

const shop_controller = require("../controllers/shop");
const shop_middleware = require("../middleware/shop");
const auth_middleware = require("../middleware/auth");


router.post("/items/", 
    [
        auth_middleware([ ["admin"], ["operator", "shop_write"] ]), 
        shop_middleware.item.validateCreate
    ], 
    shop_controller.item.create
);

router.get("/items/", shop_middleware.item.validateSearch, shop_controller.item.search);

router.get("/items/:barcode", 
    [
        auth_middleware([ ["admin"], ["operator", "shop_read"] ]),
        shop_middleware.item.validateSearchByBarcode
    ], 
    shop_controller.item.searchByBarcode
);

router.put("/items/:barcode", 
    [
        auth_middleware([ ["admin"], ["operator", "shop_write"] ]),
        shop_middleware.item.validateUpdate
    ], 
    shop_controller.item.update
);

router.delete("/items/:barcode", 
    [
        auth_middleware([ ["admin"], ["operator", "shop_write"] ]),
        shop_middleware.item.validateDelete
    ], 
    shop_controller.item.delete
);


router.post("/categories/", 
    [
        auth_middleware([ ["admin"], ["operator", "shop_write"] ]),
        shop_middleware.category.validateCreate
    ], 
    shop_controller.category.create
);

router.get("/categories/", shop_middleware.category.validateSearch, shop_controller.category.search);

router.put("/categories/:name", 
    [
        auth_middleware([ ["admin"], ["operator", "shop_write"] ]),
        shop_middleware.category.validateUpdate
    ], 
    shop_controller.category.update
);

router.delete("/categories/:name", 
    [
        auth_middleware([ ["admin"], ["operator", "shop_write"] ]),
        shop_middleware.category.validateDelete
    ], 
    shop_controller.category.delete
);


module.exports = router;