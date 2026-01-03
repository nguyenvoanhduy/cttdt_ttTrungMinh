import api from "@/util/axios";
import type { Event } from "@/types";

export const eventService = {
  getAll: () => api.get<Event[]>("/events"),

  getById: (id: string) => api.get<Event>(`/events/${id}`),

  create: (data: Partial<Event>) => api.post("/events", data).catch((error) => {
    console.error("Error creating event:", error);
    // Surface server validation payload for easier debugging
    if (error?.response?.data) console.error("Server response:", error.response.data);
    throw error;
  }),

  update: (id: string, data: Partial<Event>) =>
    api.put(`/events/${id}`, data),

  delete: (id: string) => api.delete(`/events/${id}`),

  register: (eventId: string) => 
    api.post(`/events/${eventId}/register`),

  getUserRegistrations: () => 
    api.get("/events/registrations/me"),

  updateAllStatus: () => 
    api.post("/events/update-status"),
};
