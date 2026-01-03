import api from "@/util/axios";

export interface ActivityLog {
  _id: string;
  userId: {
    _id: string;
    phonenumber: string;
    role: string;
    personalId: {
      _id: string;
      fullname: string;
      avatarUrl?: string;
    };
  };
  action: string;
  targetCollection: string;
  targetId: string;
  ip: string;
  createdAt: string;
}

export interface ActivityLogsResponse {
  logs: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const activityLogService = {
  getActivityLogs: (params?: {
    page?: number;
    limit?: number;
    action?: string;
    targetCollection?: string;
  }) => api.get<ActivityLogsResponse>("/activity-logs", { params }),

  createActivityLog: (logData: {
    action: string;
    targetCollection: string;
    targetId: string;
  }) => api.post("/activity-logs", logData),
};
