import express from "express";
import {
  getAllProfiles,
  getMyProfile,
  getProfileByUserId,
  updateMyProfile,
  uploadProfilePhoto,
} from "../controllers/profileController.js";
import { protectRoute } from "../middleware/authMiddleware.js"; // Bring in the Bouncer!
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// GET /api/profile/all - View the Alumni Directory
router.get("/all", protectRoute, getAllProfiles);

// GET /api/profile/user/:userId - View a specific user's profile
router.get("/user/:userId", protectRoute, getProfileByUserId);
// Notice how 'protect' sits right in the middle! It acts as the gatekeeper.
router.get("/", protectRoute, getMyProfile);

router.put("/", protectRoute, updateMyProfile);

// POST /api/profile/photo - Upload a new profile picture
// Notice how we use two middlewares here: 'protect' first, then 'upload'
router.post("/photo", protectRoute, upload.single("photo"), uploadProfilePhoto);
export default router;
