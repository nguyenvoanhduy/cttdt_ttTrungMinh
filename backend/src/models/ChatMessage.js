import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    sessionId: { 
        type: mongoose.Schema.Types.ObjectId, ref: "ChatSession", 
        required: true 
    },
    sender: {
        type: String, enum: ["User", "Bot"] 
    },
    message: String,
    responseTime: Number,
}, { timestamps: { createdAt: true } });

export default mongoose.model("ChatMessage", chatMessageSchema);
