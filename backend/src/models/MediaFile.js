import mongoose from "mongoose";

const mediaFileSchema = new mongoose.Schema({
    albumId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Album",
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: String,
    fileType: { 
        type: String, 
        enum: ["image", "video"],
        default: "image"
    },
    caption: String,
    uploadedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    altText: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("MediaFile", mediaFileSchema);
