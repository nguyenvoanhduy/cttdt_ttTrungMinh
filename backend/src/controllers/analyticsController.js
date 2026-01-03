import Analytics from '../models/Analytics.js';

// Ghi nhận page view
export const trackPageView = async (req, res) => {
  try {
    const { page, sessionId, visitorId, userAgent, referrer } = req.body;
    
    // Lấy IP từ request
    const ipAddress = req.ip || req.connection.remoteAddress;

    const analytics = new Analytics({
      type: 'pageview',
      page,
      sessionId,
      visitorId,
      userAgent,
      referrer,
      ipAddress,
      timestamp: new Date(),
    });

    await analytics.save();
    
    res.status(201).json({ 
      success: true,
      message: 'Page view tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error tracking page view' 
    });
  }
};

// Ghi nhận custom event
export const trackEvent = async (req, res) => {
  try {
    const { category, action, label, value, sessionId, visitorId } = req.body;
    
    const ipAddress = req.ip || req.connection.remoteAddress;

    const analytics = new Analytics({
      type: 'event',
      category,
      action,
      label,
      value,
      sessionId,
      visitorId,
      ipAddress,
      timestamp: new Date(),
    });

    await analytics.save();
    
    res.status(201).json({ 
      success: true,
      message: 'Event tracked successfully' 
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error tracking event' 
    });
  }
};

// Lấy tổng số lượt truy cập
export const getVisitStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { type: 'pageview' };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Tổng số page views
    const totalPageViews = await Analytics.countDocuments(query);
    
    // Số session unique (unique visitors trong khoảng thời gian)
    const uniqueSessions = await Analytics.distinct('sessionId', query);
    
    // Số visitor unique
    const uniqueVisitors = await Analytics.distinct('visitorId', query);

    res.json({
      success: true,
      data: {
        totalPageViews,
        uniqueSessions: uniqueSessions.length,
        uniqueVisitors: uniqueVisitors.length,
      }
    });
  } catch (error) {
    console.error('Error getting visit stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting visit stats' 
    });
  }
};

// Lấy lượt truy cập theo ngày (cho biểu đồ)
export const getDailyVisits = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const dailyStats = await Analytics.aggregate([
      {
        $match: {
          type: 'pageview',
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$visitorId" }
        }
      },
      {
        $project: {
          date: "$_id",
          visits: 1,
          uniqueVisitors: { $size: "$uniqueVisitors" },
          _id: 0
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    // Đảm bảo có đầy đủ các ngày (fill missing dates với 0)
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = dailyStats.find(d => d.date === dateStr);
      
      result.push({
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        fullDate: dateStr,
        visits: dayData ? dayData.visits : 0,
        uniqueVisitors: dayData ? dayData.uniqueVisitors : 0,
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting daily visits:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting daily visits' 
    });
  }
};

// Lấy top pages
export const getTopPages = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topPages = await Analytics.aggregate([
      {
        $match: { type: 'pageview' }
      },
      {
        $group: {
          _id: "$page",
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$visitorId" }
        }
      },
      {
        $project: {
          page: "$_id",
          views: 1,
          uniqueVisitors: { $size: "$uniqueVisitors" },
          _id: 0
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      data: topPages
    });
  } catch (error) {
    console.error('Error getting top pages:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting top pages' 
    });
  }
};
