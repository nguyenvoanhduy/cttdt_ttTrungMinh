import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface PageView {
  page: string;
  timestamp: Date;
  userAgent?: string;
  referrer?: string;
}

class AnalyticsService {
  private lastTrackedPage: string = '';
  private lastTrackTime: number = 0;
  private readonly TRACK_THROTTLE = 1000; // 1 giây

  // Ghi nhận lượt truy cập trang
  async trackPageView(page: string) {
    try {
      const now = Date.now();
      
      // Tránh track trùng lặp trong 1 giây hoặc cùng 1 trang
      if (
        this.lastTrackedPage === page && 
        (now - this.lastTrackTime) < this.TRACK_THROTTLE
      ) {
        console.log('Skipping duplicate page view tracking:', page);
        return;
      }

      this.lastTrackedPage = page;
      this.lastTrackTime = now;

      const sessionId = this.getOrCreateSessionId();
      
      const data: PageView = {
        page,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      };

      await axios.post(`${API_URL}/analytics/pageview`, {
        ...data,
        sessionId,
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  // Lấy hoặc tạo session ID để không đếm trùng trong cùng session
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    
    return sessionId;
  }

  // Lấy unique visitor ID (dùng localStorage để track unique visitors)
  private getOrCreateVisitorId(): string {
    let visitorId = localStorage.getItem('analytics_visitor_id');
    
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics_visitor_id', visitorId);
    }
    
    return visitorId;
  }

  // Ghi nhận event tùy chỉnh (click button, submit form, etc.)
  async trackEvent(category: string, action: string, label?: string, value?: number) {
    try {
      const sessionId = this.getOrCreateSessionId();
      const visitorId = this.getOrCreateVisitorId();

      await axios.post(`${API_URL}/analytics/event`, {
        category,
        action,
        label,
        value,
        sessionId,
        visitorId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Lấy thống kê lượt truy cập theo khoảng thời gian
  async getVisitStats(startDate?: Date, endDate?: Date) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await axios.get(`${API_URL}/analytics/visits?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching visit stats:', error);
      return null;
    }
  }

  // Lấy số lượt truy cập theo ngày (cho biểu đồ)
  async getDailyVisits(days: number = 7) {
    try {
      const response = await axios.get(`${API_URL}/analytics/daily-visits?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching daily visits:', error);
      return [];
    }
  }
}

export default new AnalyticsService();
