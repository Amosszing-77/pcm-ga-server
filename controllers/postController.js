const Post = require("../models/postModel");
const axios = require("axios");

// Helper function to translate text using Groq
const translateText = async (text, targetLanguage) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    const url = "https://api.groq.com/openai/v1/chat/completions";

    const response = await axios.post(
      url,
      {
        model: "openai/gpt-oss-120b", // Replace the retired llama-3.3-70b-versatile
        messages: [
          {
            role: "system",
            content:
              "You are a professional translator. Translate the text exactly as requested. Do not add any extra notes, explanations, or quotes.",
          },
          {
            role: "user",
            content: `Translate the following Mizo text into ${targetLanguage}:\n\n${text}`,
          },
        ],
        temperature: 0.2, // Low temperature keeps the translation accurate and strict
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 seconds timeout
      },
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Translation error:", error.response?.data || error.message);
    return ""; // Return empty string if it fails so the post still saves
  }
};

// @desc    Create a new post
// @route   POST /api/posts
const createPost = async (req, res) => {
  try {
    const { title, info, imageUrl } = req.body;

    if (!title || !info || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, info, and imageUrl",
      });
    }

    console.log("Translating Info to English... (Groq)");
    const infoEn = await translateText(info, "English");

    console.log("Translating Info to Myanmar... (Groq)");
    const infoMy = await translateText(info, "Burmese (Myanmar)");

    const post = await Post.create({
      title,
      info,
      imageUrl,
      titleEn: title, // Keeping title in Mizo as requested
      infoEn: infoEn,
      titleMy: title, // Keeping title in Mizo
      infoMy: infoMy,
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single post by ID
// @route   GET /api/posts/:id
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
const updatePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};
