import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  time: String,
  activity: String
}, { _id: false });

const eventSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },

  description: String,

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
    type: mongoose.Schema.Types.ObjectId,
    ref: "EventType",
    required: true
  },

  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Personal",
    required: true
  },

  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Personal"
  }],

  schedule: [scheduleSchema],

  participantsCount: {
    type: Number,
    default: 0
  },

  status: { 
    type: String, 
    enum: ["UPCOMING", "ONGOING", "COMPLETED"],
    default: "UPCOMING"
  },

  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },

}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
