import api from "@/util/axios";

export interface EventType {
  _id: string;
  name: string;
}

export const eventTypeService = {
  getAll: () => api.get<EventType[]>("/event-types"),

  create: (name: string) =>
    api.post("/event-types", { name }),

  update: (id: string, name: string) =>
    api.put(`/event-types/${id}`, { name }),

  delete: (id: string) =>
    api.delete(`/event-types/${id}`),
};
