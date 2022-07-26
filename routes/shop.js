const express = require('express');
const router = express.Router();

const shop_controller = {
    item: require("../controllers/shop/item"),
    category: require("../controllers/shop/category"),
};
const shop_middleware = {
    item: require("../middleware/shop/item"),
    category: require("../middleware/shop/category"),
};
const auth_middleware = require("../middleware/auth");


/* Crea un nuovo item con dei prodotti associati */
router.post("/items/", 
    [
        auth_middleware([ ["operator", "shop_write"] ], [ ["admin"] ]), 
        shop_middleware.item.validateCreate
    ], 
    shop_controller.item.create
);

/* Cerca determinati item dello shop paginandoli secondo un dato criterio */
router.get("/items/", shop_middleware.item.validateSearch, shop_controller.item.search);

/* Cerca un item dello shop cercandolo per barcode di uno dei prodotto associati */
router.get("/items/barcode/:barcode", 
    [
        auth_middleware([ ["operator", "shop_read"] ], [ ["admin"] ]),
        shop_middleware.item.validateSearchByBarcode
    ], 
    shop_controller.item.searchByBarcode
);

/* Cerca di un singolo item */
router.get("/items/:item_id", shop_middleware.item.validateSearchItem, shop_controller.item.searchItem);

/* Modifica le generalità di un item */
router.put("/items/:item_id", 
    [
        auth_middleware([ ["operator", "shop_write"] ], [ ["admin"] ]),
        shop_middleware.item.validateUpdateItem
    ], 
    shop_controller.item.updateItem
);

/* Modifica i dati di un prodotto */
router.put("/items/:item_id/products/:product_index",
    [
        auth_middleware([ ["operator", "shop_write"] ], [ ["admin"] ]),
        shop_middleware.item.validateUpdateProduct
    ],
    shop_controller.item.updateProduct
);

/* Cancella un item e tutti i prodotti connessi */
router.delete("/items/:item_id", 
    [
        auth_middleware([ ["operator", "shop_write"] ], [ ["admin"] ]),
        shop_middleware.item.validateDeleteItem
    ], 
    shop_controller.item.deleteItem
);

/* Cancella un prodotto di un item */
router.delete("/items/:item_id/products/:product_index",
    [
        auth_middleware([ ["operator", "shop_write"]], [ ["admin"] ]),
        shop_middleware.item.validateDeleteProduct
    ],
    shop_controller.item.deleteProduct
);


/* Carica un'immagine associata ad un prodotto */
router.post("/items/:item_id/products/:product_index/images/",
    [
        auth_middleware([ ["operator", "shop_write"] ], [ ["admin"] ]),
        shop_middleware.item.validateCreateFileUpload
    ],
    shop_controller.item.createUploadImages
);

/* Cancella un'immagine di un prodotto */
router.delete("/items/:item_id/products/:product_index/images/:image_index",
    [
        auth_middleware([ ["operator", "shop_write"] ], [ ["admin"] ]),
        shop_middleware.item.validateDeleteImage
    ],
    shop_controller.item.deleteImage
);


router.post("/categories/", [ auth_middleware([ ["operator", "shop_write"], ["admin"] ]), shop_middleware.category.validateCreate ], shop_controller.category.create);
router.get("/categories/", shop_controller.category.getAll);
router.put("/categories/:category", [ auth_middleware([ ["operator", "shop_write"], ["admin"] ]), shop_middleware.category.validateUpdate ], shop_controller.category.update);
router.delete("/categories/:category", [ auth_middleware([ ["operator", "shop_write"], ["admin"] ]), shop_middleware.category.validateDelete ], shop_controller.category.delete);

module.exports = router;