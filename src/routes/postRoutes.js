import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  toggleLike,
} from "../controllers/postController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// POST /api/posts
// We use upload.array("images", 5) to allow up to 5 images per post!
// POST /api/posts - Create a new post
router.post("/", protectRoute, upload.array("images", 5), createPost);

// GET /api/posts - Fetch the global feed
router.get("/", protectRoute, getAllPosts);

// POST /api/posts/:id/like - Toggle like on a post
router.post("/:id/like", protectRoute, toggleLike);

// DELETE /api/posts/:id - Soft delete a post
router.delete("/:id", protectRoute, deletePost);

export default router;
