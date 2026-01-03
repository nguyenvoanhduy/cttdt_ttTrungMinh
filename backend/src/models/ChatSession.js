import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  startedAt: {
    type: Date,
    default: Date.now
  },

  endedAt: Date,

  status: { 
    type: String,
    enum: ["Đang diễn ra", "Kết thúc"],
    default: "Đang diễn ra"
  },

  // 🔥 AI hay Admin đang xử lý
  mode: {
    type: String,
    enum: ["AI", "ADMIN"],
    default: "AI"
  },

  // 🔔 Admin đã nhận chat chưa
  assignedAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  }

}, { timestamps: true });

export default mongoose.model("ChatSession", chatSessionSchema);
