import api from "@/util/axios";

export interface Notification {
  _id: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: string;
  thumbnailUrl?: string;
  type: "event" | "system" | "chat" | "family" | "media" | "other";
  targetGroups: string[];
  recipients: Array<{
    userId: string;
    isRead: boolean;
    readAt?: string;
  }>;
  recipientCount?: number;
  createdAt: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface NotificationStats {
  totalNotifications: number;
  totalRecipients: number;
  readRecipients: number;
  unreadRecipients: number;
  readRate: string;
}

export const notificationService = {
  // Admin: Tạo và gửi thông báo
  create: (data: {
    title: string;
    message: string;
    type?: string;
    link?: string;
    thumbnailUrl?: string;
    targetGroups: string[];
  }) => api.post("/notifications", data),

  // Admin: Lấy tất cả thông báo
  getAll: () => api.get<Notification[]>("/notifications/all"),

  // Admin: Lấy thống kê
  getStats: () => api.get<NotificationStats>("/notifications/stats"),

  // User: Lấy thông báo của tôi
  getMyNotifications: () => api.get<{ data: Notification[]; unreadCount: number }>("/notifications/me"),

  // Đánh dấu đã đọc
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  // Đánh dấu tất cả đã đọc
  markAllAsRead: () => api.put("/notifications/read-all"),

  // Xóa thông báo
  delete: (id: string) => api.delete(`/notifications/${id}`),
};
