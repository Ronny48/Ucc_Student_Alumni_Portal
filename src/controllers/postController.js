import { prisma } from "../config/prisma.js";

export const createPost = async (req, res) => {
  try {
    const { title, body, category } = req.body;

    if (!title || !body) {
      return res
        .status(400)
        .json({ error: "Title and body are required to make a post." });
    }

    let newPost;

    // If the user attached media, create the post and media together in a transaction
    if (req.files && req.files.length > 0) {
      newPost = await prisma.$transaction(async (tx) => {
        const createdPost = await tx.post.create({
          data: {
            user_id: req.user.id,
            title,
            body,
            category,
          },
        });

        const mediaData = req.files.map((file) => ({
          post_id: createdPost.id,
          file: file.path, // This is the live Cloudinary URL
        }));

        await tx.media.createMany({
          data: mediaData,
        });

        return createdPost;
      });
    } else {
      newPost = await prisma.post.create({
        data: {
          user_id: req.user.id,
          title,
          body,
          category,
        },
      });
    }

    // Fetch the final post WITH its newly attached media to send back
    const finalPost = await prisma.post.findUnique({
      where: { id: newPost.id },
      include: { media: true },
    });

    res.status(201).json({
      message: "Post created successfully!",
      post: finalPost,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ error: "Failed to create post." });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "active" }, // Only show active posts
      orderBy: { created_at: "desc" }, // Newest posts first!
      include: {
        // Grab the author's info
        user: {
          select: {
            emall: true,
            role: true,
            profile: {
              select: {
                fullname: true,
                photo: true,
                department: true,
              },
            },
          },
        },
        // Grab any attached media
        media: true,
        // Get the total count of likes!
        _count: {
          select: { likes: true },
        },
      },
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Fetch Posts Error:", error);
    res.status(500).json({ error: "Failed to fetch posts." });
  }
};
