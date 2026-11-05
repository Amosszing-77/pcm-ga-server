const express = require("express");
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/postController");

// Route: /api/posts
router.route("/").post(createPost).get(getPosts);

// Route: /api/posts/:id
router.route("/:id").get(getPostById).put(updatePost).delete(deletePost);

module.exports = router;
