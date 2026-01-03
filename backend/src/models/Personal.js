import mongoose from "mongoose";

const templeHistorySchema = new mongoose.Schema(
  {
    templeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Temple",
      required: true,
    },
    role: {
      type: String,
    },
    startDate: {
      type: String,
    },
    endDate: {
      type: String,
    },
  },
  { _id: false }
);

const personalSchema = new mongoose.Schema({
  phonenumber: {
    type: String,
    trim: true,
    sparse: true, // Cho phép null/undefined và không bắt buộc unique
  },

  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["Nam", "Nữ"],
  },
  dateOfBirth: {
    type: Date,
  },
  address: {
    type: String,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  position: {
    type: String,
  },
  joinDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Đang hoạt động", "Tạm Nghỉ"],
  },
  avatarUrl: {
    type: String,
  },
  note: {
    type: String,
  },
  currentTempleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Temple",
  },
  templeHistory: [templeHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Personal = mongoose.model("Personal", personalSchema);
export default Personal;
