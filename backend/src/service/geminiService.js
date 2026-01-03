import axios from "axios";

export const callGemini = async (message) => {
  try {
    const res = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [
          {
            parts: [{ text: message }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        }
      }
    );

    return res.data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error("===== GEMINI ERROR =====");
    console.error(err.response?.data || err.message);
    console.error("========================");

    if (err.response?.status === 429) {
      return "Bạn đang gửi quá nhanh, vui lòng thử lại sau.";
    }

    return "Xin lỗi, hiện tại tôi không thể trả lời.";
  }
};
