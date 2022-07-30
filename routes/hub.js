const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const hub_middleware = require("../middleware/hub");
const hub_controller = require("../controllers/hub");

// Router per gli hub
router.post("/", [ auth_middleware([], [ ["admin"] ]), hub_middleware.validateInsertHub ], hub_controller.insertHub);

router.get("/", hub_middleware.validateGetHubs, hub_controller.getHubs);
// router.get("/posts/:post_id", post_middleware.validateSearchPostById, post_controller.searchPostById);

// router.put("/posts/:post_id", [ auth_middleware([ ["post_write"] ], [ ["admin"] ]), post_middleware.validateUpdatePost ], post_controller.updatePost);

// router.delete("/posts/:post_id", [ auth_middleware([ ["post_write"] ], [ ["admin"] ]), post_middleware.validateDeletePost ], post_controller.deletePost);

module.exports = router;