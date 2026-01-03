import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    link: String,
    thumbnailUrl: String,
    type: { 
        type: String, 
        enum: ["event","system","chat","family","media","other"],
        default: "system"
    },
    // Array of user IDs who should receive this notification
    recipients: [{
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        },
        isRead: { 
            type: Boolean, 
            default: false 
        },
        readAt: Date
    }],
    // Target groups (for display purposes)
    targetGroups: [{
        type: String  // "Tất cả tín đồ", "Ban Cai Quản", etc.
    }],
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

export default mongoose.model("Notification", notificationSchema);
