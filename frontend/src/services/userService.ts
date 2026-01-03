import api from "@/util/axios";

export interface User {
  _id: string;
  phonenumber: string;
  role: string;
  personalId: string | {
    _id: string;
    fullname: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  phonenumber: string;
  role: string;
  personalId: string;
}

export const userService = {
  getAll: () => api.get<User[]>("/users"),

  create: (userData: CreateUserData) => 
    api.post("/users", userData),

  updateRole: (id: string, role: string) => 
    api.put(`/users/${id}/role`, { role }),

  delete: (id: string) => api.delete(`/users/${id}`),
};
