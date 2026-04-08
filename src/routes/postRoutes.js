import express from "express";
import { createPost, getAllPosts } from "../controllers/postController.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// POST /api/posts
// We use upload.array("images", 5) to allow up to 5 images per post!
// POST /api/posts - Create a new post
router.post("/", protectRoute, upload.array("images", 5), createPost);

// GET /api/posts - Fetch the global feed
router.get("/", protectRoute, getAllPosts);

export default router;
