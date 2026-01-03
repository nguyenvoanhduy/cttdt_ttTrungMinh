import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  sessionId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatSession",
    required: true
  },

  sender: {
    type: String,
    enum: ["User", "Bot", "Admin"],
    required: true
  },

  message: {
    type: String,
    required: true
  },

  responseTime: Number

}, { timestamps: true });

export default mongoose.model("ChatMessage", chatMessageSchema);
