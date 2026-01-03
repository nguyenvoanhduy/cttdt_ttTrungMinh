import mongoose from 'mongoose';

const chatbotConfigSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: true,
  },
  name: {
    type: String,
    default: 'Trợ lý ảo Thánh Thất',
  },
  welcomeMessage: {
    type: String,
    default: 'Xin chào! Tôi có thể giúp gì cho bạn?',
  },
  suggestedQuestions: [{
    type: String,
  }],
  knowledgeBase: [{
    keyword: String,
    response: String,
  }],
}, {
  timestamps: true,
});

export default mongoose.model('ChatbotConfig', chatbotConfigSchema);
