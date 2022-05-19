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


/**
 * @api {get} /items/ Cerca determinati item dello shop paginandoli secondo un dato criterio 
 * @apiName SearchItem
 * @apiGroup Item
 *
 * @apiParam {Number}   page_size       Numero di item da estrarre
 * @apiParam {Number}   page_number     Numero di pagina da estrarre
 * @apiParam {ObjectId} [category_id]   Id della categoria degli item da cercare
 * @apiParam {String}   [name]          Nome degli item da cercare
 *
 * @apiSuccess (200) {Object[]} Vettore degli item che soddisfano i criteri di ricerca
 * @apiError   (400) {Object[]} Vettore dei campi errati
 * @apiError   (404) {Object[]} Nessun elemento trovato
 * @apiError   (500)            Errore interno
 */
router.get("/items/", shop_middleware.item.validateSearch, shop_controller.item.search);

/**
 * @api {get} /items/:barcode Cerca un item dello shop cercandolo per barcode di uno dei prodotto associati
 * @apiName SearchItemByBarcode
 * @apiGroup Item
 *
 * @apiParam {String} barcode Barcode da cercare
 *
 * @apiSuccess (200) {Object}   Item trovato
 * @apiError   (400) {Object[]} Vettore dei campi errati
 * @apiError   (404) {Object}   Nessun item trovato
 * @apiError   (500)            Errore interno
 */
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