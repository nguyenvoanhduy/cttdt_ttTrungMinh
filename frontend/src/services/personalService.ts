import api from "@/util/axios";
import type { Personal } from "@/types";

export const personalService = {
  getAll: () => api.get<Personal[]>("/personals"),

  getById: (id: string) => api.get<Personal>(`/personals/${id}`),

  create: (personalData: Partial<Personal>) => 
    api.post("/personals", personalData),

  update: (id: string, personalData: Partial<Personal>) => 
    api.put(`/personals/${id}`, personalData),

  delete: (id: string) => api.delete(`/personals/${id}`),
};
