const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    // Original (Mizo)
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    info: {
      type: String,
      required: [true, "Blog info is required"],
    },

    // English translation
    titleEn: {
      type: String,
      trim: true,
      default: "",
    },
    infoEn: {
      type: String,
      default: "",
    },

    // Myanmar translation
    titleMy: {
      type: String,
      trim: true,
      default: "",
    },
    infoMy: {
      type: String,
      default: "",
    },

    // Image
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Post", postSchema);
