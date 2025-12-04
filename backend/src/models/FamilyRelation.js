import mongoose from "mongoose";

const familyRelationSchema = new mongoose.Schema({
    personalId: { 
        type: mongoose.Schema.Types.ObjectId, ref: "Personal", 
        required: true 
    },
    relativeId: { 
        type: mongoose.Schema.Types.ObjectId, ref: "Personal", 
        required: true 
    },
    relationType: { 
        type: String, 
        required: true 
    },
}, { timestamps: true });

export default mongoose.model("FamilyRelation", familyRelationSchema);
