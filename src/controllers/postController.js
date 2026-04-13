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

// @desc    Toggle a Like on a post (Like/Unlike)
// @route   POST /api/posts/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;
    // 1. Check if the post actually exists and is active
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.status !== "active") {
      return res.status(404).json({ error: "Post not found." });
    }
    // 2. Check if the user has ALREADY liked it
    const existingLike = await prisma.like.findFirst({
      where: {
        post_id: postId,
        user_id: userId,
      },
    });
    if (existingLike) {
      // 3a. If they already liked it, UNLIKE it (Delete the like record)
      await prisma.like.delete({ where: { id: existingLike.id } });

      const likeCount = await prisma.like.count({ where: { post_id: postId } });

      return res
        .status(200)
        .json({ message: "Post unliked successfully.", likeCount });
    } else {
      // 3b. If they haven't liked it, LIKE it (Create a like record)
      await prisma.like.create({
        data: {
          post_id: postId,
          user_id: userId,
        },
      });

      const likeCount = await prisma.like.count({ where: { post_id: postId } });

      return res
        .status(201)
        .json({ message: "Post liked successfully.", likeCount });
    }
  } catch (error) {
    console.error("Like Error:", error);
    res.status(500).json({ error: "Failed to process like." });
  }
};

// @desc    Delete a post (Soft Delete)
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id;
    // 1. Find the post
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.status !== "active") {
      return res.status(404).json({ error: "Post not found." });
    }
    // 2. Security Check 🚨: Ensure the logged-in user is the actual AUTHOR of the post
    if (post.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized: You can only delete your own posts." });
    }
    // 3. Perform a Soft Delete
    await prisma.post.update({
      where: { id: postId },
      data: { status: "deleted" },
    });
    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).json({ error: "Failed to delete post." });
  }
};
