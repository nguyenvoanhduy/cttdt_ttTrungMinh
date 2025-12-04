import mongoose from "mongoose";



const eventSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    startTime: { 
        type: Date, 
        required: true 
    },
    endTime: { 
        type: Date, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    bannerUrl: {
        type: String
    },
    eventType: { 
        type: String, 
        enum: ["Lễ lớn", "Hoạt động thanh niên"] 
    },
    organizer: { 
        type: mongoose.Schema.Types.ObjectId, ref: "Personal" 
    },
    status: { 
        type: String, 
        enum: ["Sắp diễn ra", "Đang diễn ra", "Đã kết thúc"] 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
