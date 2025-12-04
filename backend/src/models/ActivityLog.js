import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, ref: "User" 
    },
    action: String,
    targetCollection: String,
    targetId: mongoose.Schema.Types.ObjectId,
    ip: String,
    createdAt: { 
        type: Date, default: Date.now 
    },
});

export default mongoose.model("ActivityLog", activityLogSchema);
