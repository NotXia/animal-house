const express = require('express');
const router = express.Router();

const shop_controller = require("../controllers/shop");
const auth_middleware = require("../middleware/auth");


router.post("/items/", auth_middleware([ ["admin"], ["operator", "shop_write"] ]), shop_controller.item.create);

router.get("/items/", shop_controller.item.search);
router.get("/items/:barcode", auth_middleware([ ["admin"], ["operator", "shop_read"] ]), shop_controller.item.searchByBarcode);

router.put("/items/:barcode", auth_middleware([ ["admin"], ["operator", "shop_write"] ]), shop_controller.item.update);

router.delete("/items/:barcode", auth_middleware([ ["admin"], ["operator", "shop_write"] ]), shop_controller.item.delete);


router.post("/categories/", auth_middleware([ ["admin"], ["operator", "shop_write"] ]), shop_controller.category.create);

router.get("/categories/", shop_controller.category.search);

router.put("/categories/:name", auth_middleware([ ["admin"], ["operator", "shop_write"] ]), shop_controller.category.update);

router.delete("/categories/:name", auth_middleware([ ["admin"], ["operator", "shop_write"] ]), shop_controller.category.delete);


module.exports = router;