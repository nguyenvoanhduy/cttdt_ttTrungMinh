import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const sendChatMessage = async (
  userId: string,
  message: string
) => {
  const res = await axios.post(`${API_URL}/chat/send`, {
    userId,
    message,
  });

  return res.data;
};
