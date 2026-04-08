import { prisma } from "../config/prisma.js";

export const getMyProfile = async (req, res) => {
  try {
    // req.user.id comes directly from our 'protectRoute' middleware!
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true }, // Pull in the attached Profile table
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      id: user.id,
      emall: user.emall,
      role: user.role,
      status: user.status,
      profile: user.profile,
    });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch profile." });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    //Grab whatever fields the user sent in the request body
    const {
      fullname,
      graduation_year,
      department,
      program,
      bio,
      contact_info,
    } = req.body;

    // Update the profile in Postgres
    // We use the req.user.id from the Bouncer (protectRoute middleware)
    const updatedProfile = await prisma.profile.upsert({
      where: { user_id: req.user.id },
      update: {
        fullname,
        graduation_year: graduation_year
          ? parseInt(graduation_year)
          : undefined,
        department,
        program,
        bio,
        contact_info,
      },
      create: {
        user_id: req.user.id,
        fullname,
        graduation_year: graduation_year ? parseInt(graduation_year) : null,
        department,
        program,
        bio,
        contact_info,
      },
    });

    //Send the shiny new profile back
    res.status(200).json({
      message: "Profile updated successfully!",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
};

export const getAllProfiles = async (req, res) => {
  try {
    // Fetch all profiles, and include the basic user info (like email)
    const profiles = await prisma.profile.findMany({
      include: {
        user: {
          select: { emall: true, role: true, status: true },
        },
      },
    });

    res.status(200).json(profiles);
  } catch (error) {
    console.error("Fetch All Profiles Error:", error);
    res.status(500).json({ error: "Failed to fetch profiles." });
  }
};

export const getProfileByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: { emall: true, role: true, status: true },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    res.status(500).json({ error: "Failed to fetch profile." });
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    // Multer/Cloudinary automatically attaches the file data to req.file!
    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image." });
    }

    // This is the beautiful, live URL from Cloudinary
    const photoUrl = req.file.path;

    // Update the profile in Postgres
    const updatedProfile = await prisma.profile.update({
      where: { user_id: req.user.id },
      data: { photo: photoUrl },
    });

    res.status(200).json({
      message: "Profile photo updated successfully!",
      photoUrl: updatedProfile.photo,
    });
  } catch (error) {
    console.error("Photo Upload Error:", error);
    res.status(500).json({ error: "Failed to upload photo." });
  }
};
