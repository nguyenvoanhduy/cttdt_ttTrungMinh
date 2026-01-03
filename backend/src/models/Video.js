import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  youtubeId: { type: String, required: true },
  thumbnailUrl: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  uploadDate: { type: Date, default: Date.now },
  category: { type: String },
  viewCount: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "hidden"], default: "active" },
});

export default mongoose.model("Video", videoSchema);
