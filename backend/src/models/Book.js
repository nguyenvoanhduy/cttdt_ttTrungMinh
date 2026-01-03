import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    categories: [{ type: String }],
    uploadedBy: { 
        type: mongoose.Schema.Types.ObjectId, ref: "User" 
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    fileUrl: {
        type: String,
        required: true
    },
    coverImageUrl: {
        type: String
    },
    fileType: { 
        type: String, enum: ["pdf", "docx"] 
    },
    downloadCount: { 
        type: Number, default: 0 
    },
    viewCount: { 
        type: Number, default: 0 
    },
    status: { 
        type: String, enum: ["active", "hidden"], 
        default: "active" 
    },
});

export default mongoose.model("Book", bookSchema);
