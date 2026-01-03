import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  // Loại: pageview hoặc event
  type: {
    type: String,
    enum: ['pageview', 'event'],
    required: true,
  },
  
  // Thông tin page view
  page: {
    type: String,
  },
  
  // Thông tin event
  category: String,
  action: String,
  label: String,
  value: Number,
  
  // Session và visitor tracking
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  visitorId: String,
  
  // Thông tin thiết bị và trình duyệt
  userAgent: String,
  referrer: String,
  
  // IP và location (có thể thêm sau)
  ipAddress: String,
  country: String,
  city: String,
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Index để query nhanh
analyticsSchema.index({ type: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1, timestamp: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
