import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";
import { callGemini } from "../service/geminiService.js";
import { getThanhThatContext } from "../service/templeData.js";
import Event from "../models/Event.js";
import Book from "../models/Book.js";
import Temple from "../models/Temple.js";
import mongoose from "mongoose";

/* ================= USER SEND MESSAGE ================= */
export const sendMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;

    const finalUserId = mongoose.Types.ObjectId.isValid(userId)
      ? userId
      : null; // guest

    /* ===== CREATE SESSION ===== */
    const session = await ChatSession.create({
      userId: finalUserId,
      startedAt: new Date()
    });

    /* ===== SAVE USER MESSAGE ===== */
    await ChatMessage.create({
      sessionId: session._id,
      sender: "User",
      message
    });

    /* ===== ADMIN CALL ===== */
    if (message.trim().toLowerCase() === "/admin") {
      return res.json({
        sessionId: session._id,
        reply: "Bạn đã được kết nối với Admin."
      });
    }

    /* ===== CHAT HISTORY ===== */
    const history = await ChatMessage.find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .limit(10);

    const historyText = history
      .map(m => `${m.sender}: ${m.message}`)
      .join("\n");

    /* ===== CONTEXT FROM DB ===== */
    const dbContext = await getThanhThatContext();

    /* ===== PROMPT ===== */
    const prompt = `
Bạn là trợ lý ảo của Thánh Thất Trung Minh.
Chỉ trả lời dựa trên thông tin bên dưới.
Nếu không có dữ liệu, hãy trả lời lịch sự rằng bạn chưa có thông tin.
Nếu được hỏi về các chủ đề ngoài Thánh Thất Trung Minh, hãy từ chối trả lời một cách lịch sự không cần trả lời bạn bị thiếu thông tin.
Nếu được hỏi về Nguyễn Thị Thu Hà hoặc Nguyễn Võ Anh Duy là ai thì trả lời họ là người xây dựng trang web này.
${dbContext}

Lịch sử hội thoại:
${historyText}

User: ${message}
Bot:
`;

    /* ===== AI ===== */
    const reply = await callGemini(prompt);

    /* ===== SAVE BOT MESSAGE ===== */
    await ChatMessage.create({
      sessionId: session._id,
      sender: "Bot",
      message: reply
    });

    res.json({
      sessionId: session._id,
      reply
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi xử lý chat" });
  }
};

/* ================= ADMIN REPLY ================= */
export const adminReply = async (req, res) => {
  const { sessionId, message } = req.body;

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return res.status(400).json({ error: "sessionId không hợp lệ" });
  }

  if (!message) {
    return res.status(400).json({ error: "Thiếu nội dung tin nhắn" });
  }

  await ChatMessage.create({
    sessionId,
    sender: "Admin",
    message
  });

  // realtime
  const io = req.app.get("io");
  io.to(sessionId).emit("new_message", {
    sender: "Admin",
    message
  });

  res.json({ success: true });
};

/* ================= GET CHAT HISTORY ================= */
export const getMessagesBySession = async (req, res) => {
  const { sessionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return res.status(400).json({ error: "sessionId không hợp lệ" });
  }

  const messages = await ChatMessage.find({ sessionId })
    .sort({ createdAt: 1 });

  res.json(messages);
};

/* ================= GET ALL SESSIONS (ADMIN) ================= */
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find()
      .populate('userId', 'name email phoneNumber')
      .sort({ startedAt: -1 })
      .limit(100);

    // Get last message for each session
    const sessionsWithLastMessage = await Promise.all(
      sessions.map(async (session) => {
        const lastMessage = await ChatMessage.findOne({ sessionId: session._id })
          .sort({ createdAt: -1 });
        
        return {
          ...session.toObject(),
          lastMessage: lastMessage?.message || "Chưa có tin nhắn"
        };
      })
    );

    res.json({ data: sessionsWithLastMessage });
  } catch (err) {
    console.error('Error getting sessions:', err);
    res.status(500).json({ error: "Lỗi lấy danh sách chat" });
  }
};

/* ================= SUGGESTED QUESTIONS ================= */
export const getSuggestedQuestions = async (req, res) => {
  const questions = [];

  const event = await Event.findOne({ status: "Sắp diễn ra" });
  const book = await Book.findOne({ status: "active" });
  const temple = await Temple.findOne();

  if (event)
    questions.push(`Sự kiện ${event.name} diễn ra khi nào?`);

  if (book)
    questions.push(`Giáo lý trong sách ${book.title} nói về điều gì?`);

  if (temple)
    questions.push(`Địa chỉ ${temple.name} ở đâu?`);

  questions.push("Làm sao để đăng ký quy y?");
  questions.push("Liên hệ Ban Cai Quản bằng cách nào?");

  res.json(questions);
};

/* ================= DELETE SESSION (ADMIN) ================= */
export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: "sessionId không hợp lệ" });
    }

    // Delete all messages in the session
    await ChatMessage.deleteMany({ sessionId });
    
    // Delete the session
    await ChatSession.findByIdAndDelete(sessionId);

    res.json({ success: true, message: "Xóa hội thoại thành công" });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ error: "Lỗi xóa hội thoại" });
  }
};
