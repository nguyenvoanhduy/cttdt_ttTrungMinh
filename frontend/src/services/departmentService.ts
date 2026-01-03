import api from "@/util/axios";

export interface Department {
  _id: string;
  name: string;
  description?: string;
  managerId?: {
    _id: string;
    fullname: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const departmentService = {
  getAll: () => api.get<{ success: boolean; data: Department[] }>("/departments"),
  
  getById: (id: string) => api.get<{ success: boolean; data: Department }>(`/departments/${id}`),
  
  create: (data: { name: string; description?: string; managerId?: string }) =>
    api.post<{ success: boolean; data: Department }>("/departments", data),
  
  update: (id: string, data: { name?: string; description?: string; managerId?: string }) =>
    api.put<{ success: boolean; data: Department }>(`/departments/${id}`, data),
  
  delete: (id: string) => api.delete<{ success: boolean; message: string }>(`/departments/${id}`),
};
