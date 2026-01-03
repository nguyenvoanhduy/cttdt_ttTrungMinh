import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    coverImage: String,
    date: Date,
    location: String,
    description: String,
    isEvent: {
        type: Boolean,
        default: false
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Album", albumSchema);
