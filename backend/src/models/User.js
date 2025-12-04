import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  phonenumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'Thành Viên'   
  },
  personalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Personal',
    required: true
  },
  refreshToken: {
    type: String
  },
  lastLogin: {
    type: Date
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

const User = mongoose.model('User', userSchema);
export default User;