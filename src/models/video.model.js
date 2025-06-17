import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongoosePaginate);

export const video = mongoose.model("video", videoSchema);
