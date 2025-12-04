import mongoose from "mongoose";


const eventMediaSchema = new mongoose.Schema({
    eventId: { 
        type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    fileUrl: { 
        type: String, required: true 
    },
    fileType: { 
        type: String, enum: ["image", "video"], default: "image" 
    },
    uploadedBy: { 
        type: mongoose.Schema.Types.ObjectId, ref: "User" 
    },
    description: String,
    createdAt: { 
        type: Date, default: Date.now 
    },
});

export default mongoose.model("EventMedia", eventMediaSchema);
