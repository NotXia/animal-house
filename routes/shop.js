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


router.post("/items/", 
    [
        auth_middleware([ ["admin"], ["operator", "shop_write"] ]), 
        shop_middleware.item.validateCreate
    ], 
    shop_controller.item.create
);

router.post("/items/:item_id/products/:product_index/images/", 
    [
        auth_middleware([["admin"], ["operator", "shop_write"]]),
        shop_middleware.item.validateCreateFileUpload
    ], 
    shop_controller.item.createUploadImages
);

/**
 * @api {get} /items/ Cerca determinati item dello shop paginandoli secondo un dato criterio 
 * @apiGroup Item
 *
 * @apiParam {Number}   page_size       Numero di item da estrarre
 * @apiParam {Number}   page_number     Numero di pagina da estrarre
 * @apiParam {ObjectId} [category_id]   Id della categoria degli item da cercare
 * @apiParam {String}   [name]          Nome degli item da cercare
 *
 * @apiSuccess (200) {Object[]} Vettore degli item che soddisfano i criteri di ricerca
 * @apiError   (400)            Parametri errati
 * @apiError   (404)            Nessun elemento trovato
 * @apiError   (500)            Errore interno
 */
router.get("/items/", shop_middleware.item.validateSearch, shop_controller.item.search);

/**
 * @api {get} /items/:barcode Cerca un item dello shop cercandolo per barcode di uno dei prodotto associati
 * @apiGroup Item
 *
 * @apiParam {String} barcode Barcode da cercare
 *
 * @apiSuccess (200) {Object}   Item trovato
 * @apiError   (400)            Parametri errati
 * @apiError   (404)            Nessun item trovato
 * @apiError   (500)            Errore interno
 */
router.get("/items/:barcode", 
    [
        auth_middleware([ ["admin"], ["operator", "shop_read"] ]),
        shop_middleware.item.validateSearchByBarcode
    ], 
    shop_controller.item.searchByBarcode
);

/**
 * @api {get} /items/:item_id/products Cerca i prodotti associati ad un item
 * @apiGroup Item
 *
 * @apiParam {String} item_id ObjectId dell'item
 *
 * @apiSuccess (200) {Object}   Prodotti trovati
 * @apiError   (400)            Parametri errati
 * @apiError   (404)            Nessun prodotto trovato
 * @apiError   (500)            Errore interno
 */
router.get("/items/:item_id/products/", shop_middleware.item.validateSearchProducts, shop_controller.item.searchProducts);

router.put("/items/:item_id", 
    [
        auth_middleware([ ["admin"], ["operator", "shop_write"] ]),
        shop_middleware.item.validateUpdateItem
    ], 
    shop_controller.item.updateItem
);

router.put("/items/:item_id/products/:product_index",
    [
        auth_middleware([["admin"], ["operator", "shop_write"]]),
        shop_middleware.item.validateUpdateProduct
    ],
    shop_controller.item.updateProduct
);

router.delete("/items/:item_id", 
    [
        auth_middleware([ ["admin"], ["operator", "shop_write"] ]),
        shop_middleware.item.validateDeleteItem
    ], 
    shop_controller.item.deleteItem
);

router.delete("/items/:item_id/products/:product_index",
    [
        auth_middleware([["admin"], ["operator", "shop_write"]]),
        shop_middleware.item.validateDeleteProduct
    ],
    shop_controller.item.deleteProduct
);

router.delete("/items/:item_id/products/:product_index/images/:image_index",
    [
        auth_middleware([["admin"], ["operator", "shop_write"]]),
        shop_middleware.item.validateDeleteImage
    ],
    shop_controller.item.deleteImage
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