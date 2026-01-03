import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    lyrics: {
        type: String
    },
    lyricsUrl: {
        type: String  // URL to PDF/DOCX file containing lyrics
    },
    audioUrl: {
        type: String,
        required: true
    },
    coverImageUrl: {
        type: String
    },
    uploadedBy: { 
        type: mongoose.Schema.Types.ObjectId, ref: "User" 
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String
    },
    duration: {
        type: Number
    },
    fileType: { 
        type: String, enum: ["mp3", "wav"] 
    },
    playCount: {   
        type: Number, default: 0 
    },
    status: { 
        type: String, enum: ["active", "hidden"], default: "active" 
    },
});

export default mongoose.model("Song", songSchema);
