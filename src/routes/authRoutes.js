import express from "express";
import {
  requestOTP,
  registerUser,
  loginUser,
  verifyEmail,
} from "../controllers/authController.js";
import { validateUCCEmail } from "../middleware/domainValidator.js";
import { requireHuman } from "../middleware/arcjetMiddleware.js";

const router = express.Router();

// The Gauntlet: Arcjet -> Domain Check -> Controller (OTP Generation)
router.post("/request-otp", validateUCCEmail, requestOTP);

router.post("/verify-otp", verifyEmail);
// Step 2: Verify OTP and Register (Step 6 on your list)
router.post("/register", requireHuman, validateUCCEmail, registerUser);

router.post("/login", loginUser);

export default router;
