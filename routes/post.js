const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const post_middleware = require("../middleware/post");
const post_controller = require("../controllers/post");

router.post("/posts/", [ auth_middleware([ ["write_post"], ["user"], ["admin"] ]), post_middleware.validateInsertPost ], post_controller.insertPost);

router.get("/posts/users/:user_id", [ auth_middleware([ ["user"], ["admin"] ]), post_middleware.validateSearchPostByUser ], post_controller.searchPostByUser);
router.get("/posts/:post_id", [ auth_middleware([ ["user"], ["admin"] ]), post_middleware.validateSearchPostById ], post_controller.searchPostById);
router.get("/posts/category/:category", [ auth_middleware([ ["user"], ["admin"] ]), post_middleware.validateSearchPostByCategory ], post_controller.searchPostByCategory);

router.put("/posts/:post_id", [ auth_middleware([ ["write_post"], ["user"], ["admin"] ]), post_middleware.validateUpdatePost ], post_controller.updatePostById);

// router.put("/customers/:username", [ auth_middleware([ ["user"], ["admin"] ]), user_middleware.validateUpdateUser ], user_controller.updateUser(false));
// router.delete("/customers/:username", [ auth_middleware([ ["user"], ["admin"] ]), user_middleware.validateDeleteUser ], user_controller.deleteUser(false));

// router.post("/operators/", [ auth_middleware([ ["admin"] ]), user_middleware.validateInsertOperator ], user_controller.insertOperator);
// router.get("/operators/:username", [ auth_middleware([ ["operator"], ["admin"] ]), user_middleware.validateSearchUser ], user_controller.searchUser(true));
// router.put("/operators/:username", [ auth_middleware([ ["admin"] ]), user_middleware.validateUpdateUser ], user_controller.updateUser(true));
// router.delete("/operators/:username", [ auth_middleware([ ["admin"] ]), user_middleware.validateDeleteUser ], user_controller.deleteUser(true));

module.exports = router;