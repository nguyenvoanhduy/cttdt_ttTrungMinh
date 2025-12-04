import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, ref: "User" 
    },
    title: String,
    message: String,
    link: String,
    isRead: { 
        type: Boolean, default: false 
    },
    thumbnailUrl: String,
    type: { type: String, 
        enum: ["event","system","chat","family","media","other"] 
    },
    createdAt: { 
        type: Date, default: Date.now 
    },
});

export default mongoose.model("Notification", notificationSchema);
