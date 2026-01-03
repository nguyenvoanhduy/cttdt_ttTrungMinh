import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema({
    eventId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Event", required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true 
    },
    registrationDate: Date,
    status: { type: String, 
        enum: ["Đã xác nhận", "Đã hủy"] 
    },
}, { timestamps: true });

export default mongoose.model("EventRegistration", eventRegistrationSchema);
