import express from "express";
import { createPost, getAllPosts } from "../controllers/postController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/posts - Create a new post
router.post("/", protectRoute, createPost);

// GET /api/posts - Fetch the global feed
router.get("/", protectRoute, getAllPosts);

export default router;
