const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const post_middleware = require("../middleware/post");
const post_controller = require("../controllers/post");

// Router per i post

router.post("/posts/", [ auth_middleware([ ["write_post"], ["user"], ["admin"] ]), post_middleware.validateInsertPost ], post_controller.insertPost);

router.get("/posts/users/:user_id", [ auth_middleware([ ["user"], ["admin"] ]), post_middleware.validateSearchPostByUser ], post_controller.searchPostByUser);
router.get("/posts/:post_id", [ auth_middleware([ ["user"], ["admin"] ]), post_middleware.validateSearchPostById ], post_controller.searchPostById);
router.get("/posts/category/:category", [ auth_middleware([ ["user"], ["admin"] ]), post_middleware.validateSearchPostByCategory ], post_controller.searchPostByCategory);

router.put("/posts/:post_id", [ auth_middleware([ ["write_post"], ["user"], ["admin"] ]), post_middleware.validateUpdatePost ], post_controller.updatePost);

router.delete("/customers/:post_id", [ auth_middleware([ ["user"], ["admin"] ]), user_middleware.validateDeletePost ], post_controller.deletePost);

// Router per i commenti 

router.post("/posts/:post_id/comments/", [ auth_middleware([ ["write_post"], ["user"], ["admin"] ]), post_middleware.validateInsertComment ], post_controller.insertComment);

router.get("/posts/:post_id/comments/", [ auth_middleware([ ["user"], ["admin"] ]), post_middleware.validateSearchCommentByPost ], post_controller.searchCommentByPost);
router.get("/posts/:post_id/comments/:comment_index", [ auth_middleware([ ["user"], ["admin"] ]), post_middleware.validateSearchCommentByIndex ], post_controller.searchCommentByIndex);

router.put("/posts/:post_id/comments/:comment_index", [ auth_middleware([ ["write_post"], ["user"], ["admin"] ]), post_middleware.validateUpdateComment ], post_controller.updateComment);

// router.delete("/customers/:post_id/:comment_index", [ auth_middleware([ ["user"], ["admin"] ]), user_middleware.validateDeleteComment ], post_controller.deleteComment);

module.exports = router;