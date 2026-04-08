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

//Get my Profile
router.get("/", protectRoute, getMyProfile);

//upgate my Profile
router.put("/", protectRoute, updateMyProfile);

// GET /api/profile/all - View the Alumni Directory
router.get("/all", protectRoute, getAllProfiles);

// GET /api/profile/user/:userId - View a specific user's profile
router.get("/user/:userId", protectRoute, getProfileByUserId);

// POST /api/profile/photo - Upload a new profile picture
router.post("/photo", protectRoute, upload.single("photo"), uploadProfilePhoto);
export default router;
