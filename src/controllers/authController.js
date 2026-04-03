import { generateOTP, saveOTP, verifyOTP } from "../utils/otpTool.js";
import { sendOTPEmail } from "../utils/mailer.js";
import { prisma } from "../config/prisma.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwtTools.js";
import jwt from "jsonwebtoken";
import "dotenv/config"; // Load environment variables from .env file

export const requestOTP = async (req, res) => {
  try {
    const { emall } = req.body; // Accessing the custom 'emall' field

    // 1. Check if user already exists in Postgres
    const existingUser = await prisma.user.findUnique({
      where: { emall },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "A user with this email already exists." });
    }

    // 2. Generate and save OTP to Redis
    const otp = generateOTP();
    await saveOTP(emall, otp);

    // 3. Send the email via Nodemailer
    await sendOTPEmail(emall, otp);

    res.status(200).json({ message: "OTP sent successfully to your email." });
  } catch (error) {
    console.error("OTP Request Error:", error);
    res.status(500).json({ error: "An error occurred while requesting OTP." });
  }
};

/// Verify OTP
export const verifyEmail = async (req, res) => {
  try {
    const { emall, otp } = req.body;

    if (!emall || !otp) {
      return res
        .status(400)
        .json({ error: "Please provide both Email and OTP." });
    }

    // 1. Verify the OTP with Upstash Redis
    const otpCheck = await verifyOTP(emall, otp);

    if (!otpCheck.valid) {
      return res.status(400).json({ error: otpCheck.message });
    }

    // 2. OTP is valid! Create a 1-hour VIP Pass for registration
    const registrationToken = jwt.sign(
      { verifiedEmail: emall },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    // 3. Send the pass back to the user!
    res.status(200).json({
      message:
        "Email verified successfully! You have 1 hour to complete your profile.",
      registrationToken,
    });
  } catch (error) {
    console.error("OTP Verification error:", error);
    res.status(500).json({ error: "An error occurred during verification" });
  }
};

// Register User
export const registerUser = async (req, res) => {
  try {
    const {
      emall,
      password,
      fullname,
      graduation_year,
      department,
      program,
      contact_info,
      registrationToken, // 🚨 We now require the VIP pass!
    } = req.body;

    // 1. Check if they provided the required fields AND the token
    if (
      !emall ||
      !password ||
      !fullname ||
      !graduation_year ||
      !registrationToken
    ) {
      return res.status(400).json({
        error:
          "Please provide all required fields, including your verified registration token.",
      });
    }

    // 2. Check the VIP Pass to ensure they actually verified this exact email
    try {
      const decoded = jwt.verify(registrationToken, process.env.JWT_SECRET);
      if (decoded.verifiedEmail !== emall) {
        return res.status(401).json({
          error:
            "Email mismatch. You cannot register a different email than the one you verified.",
        });
      }
    } catch (err) {
      return res.status(401).json({
        error:
          "Registration session expired or invalid. Please request a new OTP.",
      });
    }

    // 3. Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Save the user AND profile to Postgres via Prisma
    const newUser = await prisma.user.create({
      data: {
        emall,
        password_hash: hashedPassword,
        profile: {
          create: {
            fullname,
            graduation_year: graduation_year ? parseInt(graduation_year) : null,
            department,
            program,
            contact_info,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // 5. Generate the OFFICIAL JWT (Digital ID Card) for logging in
    const token = generateToken(newUser.id);

    // 6. Send back the success response!
    res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        id: newUser.id,
        emall: newUser.emall,
        role: newUser.role,
        profile: newUser.profile,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "An error occurred during registration." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { emall, password } = req.body;

    if (!emall || !password) {
      return res.status(400).json({
        error: "Please provide Email and Password",
      });
    }

    const user = await prisma.user.findUnique({ where: { emall } });

    if (!user) {
      return res.status(400).json({ error: "Email not registered" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Wrong Password. try again" });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        emall: user.emall,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LogIn Error: ", error);
    res.status(500).json({
      error: "An error occured during login",
    });
  }
};
