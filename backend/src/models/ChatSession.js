import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, ref: "User" 
    },
    startedAt: Date,
    endedAt: Date,
    status: { 
        type: String, enum: ["Đang diễn ra", "Kết thúc"], default: "Đang diễn ra" 
    },
});

export default mongoose.model("ChatSession", chatSessionSchema);
