const express = require('express');
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const post_middleware = require("../middleware/post");
const post_controller = require("../controllers/post");

// Router per i post

router.post("/posts/", [ auth_middleware([ ["post_write"], ["admin"] ]), post_middleware.validateInsertPost ], post_controller.insertPost);

router.get("/posts/users/:username", [ auth_middleware([ ["post_read"], ["admin"] ]), post_middleware.validateSearchPostByUser ], post_controller.searchPostByUser);
router.get("/posts/:post_id", [ auth_middleware([ ["post_read"], ["admin"] ]), post_middleware.validateSearchPostById ], post_controller.searchPostById);
router.get("/posts/category/:category", [ auth_middleware([ ["post_read"], ["admin"] ]), post_middleware.validateSearchPostByCategory ], post_controller.searchPostByCategory);

router.put("/posts/:post_id", [ auth_middleware([ ["post_write"], ["admin"] ]), post_middleware.validateUpdatePost ], post_controller.updatePost);

router.delete("/posts/:post_id", [ auth_middleware([ ["post_write"], ["admin"] ]), post_middleware.validateDeletePost ], post_controller.deletePost);

// Router per i commenti

router.post("/posts/:post_id/comments/", [ auth_middleware([ ["comment_write"], ["admin"] ]), post_middleware.validateInsertComment ], post_controller.insertComment);

router.get("/posts/:post_id/comments/", [ auth_middleware([ ["comment_read"], ["admin"] ]), post_middleware.validateSearchCommentByPost ], post_controller.searchCommentByPost);
router.get("/posts/:post_id/comments/:comment_index", [ auth_middleware([ ["comment_read"], ["admin"] ]), post_middleware.validateSearchCommentByIndex ], post_controller.searchCommentByIndex);

router.put("/posts/:post_id/comments/:comment_index", [ auth_middleware([ ["comment_write"], ["admin"] ]), post_middleware.validateUpdateComment ], post_controller.updateComment);

router.delete("/posts/:post_id/:comment_index", [ auth_middleware([ ["comment_write"], ["admin"] ]), post_middleware.validateDeleteComment ], post_controller.deleteComment);

module.exports = router;