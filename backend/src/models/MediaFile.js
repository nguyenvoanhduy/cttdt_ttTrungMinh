import mongoose from "mongoose";

const mediaFileSchema = new mongoose.Schema({
    fileUrl: String,
    thumbnailUrl: String,
    fileType: { 
        type: String, enum: ["image", "video"] 
    },
    uploadedBy: { 
        type: mongoose.Schema.Types.ObjectId, ref: "User" 
    },
    altText: String,
    createdAt: { 
        type: Date, default: Date.now 
    },
});

export default mongoose.model("MediaFile", mediaFileSchema);
