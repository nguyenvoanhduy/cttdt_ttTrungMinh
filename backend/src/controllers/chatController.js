import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";
import { callGemini } from "../service/geminiService.js";
import { getThanhThatContext } from "../service/templeData.js";
import Event from "../models/Event.js";
import Book from "../models/Book.js";
import Temple from "../models/Temple.js";
import Song from "../models/Song.js";
import Department from "../models/Department.js";
import User from "../models/User.js";
import Video from "../models/Video.js";
import Personal from "../models/Personal.js";
import mongoose from "mongoose";
import { solarToLunar } from "../utils/lunarCalendar.js";

/* ================= USER SEND MESSAGE ================= */
export const sendMessage = async (req, res) => {
  try {
    const { userId, message, sessionId } = req.body;

    const finalUserId = mongoose.Types.ObjectId.isValid(userId)
      ? userId
      : null; // guest

    let session;

    /* ===== FIND OR CREATE SESSION ===== */
    if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
      // Nếu có sessionId, tìm session đó
      session = await ChatSession.findById(sessionId);
      
      // Nếu không tìm thấy, tạo mới
      if (!session) {
        session = await ChatSession.create({
          userId: finalUserId,
          startedAt: new Date()
        });
      }
    } else if (finalUserId) {
      // Tìm session gần nhất của user trong vòng 24h
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      session = await ChatSession.findOne({
        userId: finalUserId,
        startedAt: { $gte: oneDayAgo }
      }).sort({ startedAt: -1 });

      // Nếu không có session trong 24h, tạo mới
      if (!session) {
        session = await ChatSession.create({
          userId: finalUserId,
          startedAt: new Date()
        });
      }
    } else {
      // Guest user luôn tạo session mới
      session = await ChatSession.create({
        userId: null,
        startedAt: new Date()
      });
    }

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
      .limit(20); // Tăng limit để nhớ nhiều hơn

    const historyText = history
      .map(m => `${m.sender}: ${m.message}`)
      .join("\n");

    /* ===== GET USER INFO ===== */
    let userInfo = "Người dùng khách (chưa đăng nhập)";
    if (finalUserId) {
      const user = await User.findById(finalUserId)
        .populate('personalId', 'fullname email phonenumber gender dateOfBirth address position')
        .select('phonenumber role');
      
      if (user && user.personalId) {
        const personal = user.personalId;
        const age = personal.dateOfBirth ? new Date().getFullYear() - new Date(personal.dateOfBirth).getFullYear() : 'Chưa có';
        userInfo = `
- Họ tên: ${personal.fullname}
- Giới tính: ${personal.gender || 'Chưa cập nhật'}
- Tuổi: ${age}
- Số điện thoại: ${personal.phonenumber || user.phonenumber}
- Email: ${personal.email || 'Chưa cập nhật'}
- Địa chỉ: ${personal.address || 'Chưa cập nhật'}
- Chức vụ: ${personal.position || 'Thành viên'}
- Vai trò trong hệ thống: ${user.role}`;
      }
    }

    /* ===== GET DATE INFO ===== */
    const now = new Date();
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const solarDate = `${dayNames[now.getDay()]}, ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} - ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Tính âm lịch (sử dụng thuật toán Hồ Ngọc Đức)
    const lunar = solarToLunar(now.getDate(), now.getMonth() + 1, now.getFullYear());
    const lunarDate = `${lunar.lunarDay}/${lunar.lunarMonth}/${lunar.lunarYear}`;

    /* ===== CONTEXT FROM DB ===== */
    const dbContext = await getThanhThatContext();

    // Lấy thêm thông tin chi tiết
    const [temples, events, departments, books, songs, videos] = await Promise.all([
      Temple.find().select('name address establishedDate description'),
      Event.find({ status: { $in: ['UPCOMING', 'ONGOING'] } })
        .populate('eventType', 'name')
        .populate('organizer', 'fullname phonenumber')
        .select('name description startTime endTime location participantsCount schedule'),
      Department.find()
        .populate('managerId', 'fullname phonenumber email')
        .select('name description managerId'),
      Book.find({ status: 'active' })
        .select('title description categories viewCount downloadCount'),
      Song.find({ status: 'active' })
        .select('title lyrics category playCount duration'),
      Video.find({ status: 'active' })
        .select('title description category viewCount youtubeId')
    ]);

    // Format thông tin Thánh Thất
    const templesInfo = temples.map(t => {
      const established = t.establishedDate ? new Date(t.establishedDate).toLocaleDateString('vi-VN') : 'Chưa rõ';
      return `- ${t.name}
  Địa chỉ: ${t.address}
  Ngày thành lập: ${established}
  Giới thiệu: ${t.description || 'Chưa có'}`;
    }).join('\n\n');

    // Format thông tin Sự kiện
    const eventsInfo = events.map(e => {
      const start = new Date(e.startTime).toLocaleString('vi-VN');
      const end = new Date(e.endTime).toLocaleString('vi-VN');
      const organizer = e.organizer ? e.organizer.fullname : 'Chưa rõ';
      const scheduleText = e.schedule && e.schedule.length > 0 
        ? '\n  Lịch trình:\n' + e.schedule.map(s => `    + ${s.time}: ${s.activity}`).join('\n')
        : '';
      return `- ${e.name}${e.eventType ? ` (${e.eventType.name})` : ''}
  Mô tả: ${e.description || 'Chưa có'}
  Thời gian: ${start} đến ${end}
  Địa điểm: ${e.location}
  Người tổ chức: ${organizer}
  Số người tham gia: ${e.participantsCount}${scheduleText}`;
    }).join('\n\n');

    // Format thông tin Ban
    const departmentsInfo = departments.map(d => {
      const manager = d.managerId 
        ? `${d.managerId.fullname} (${d.managerId.phonenumber || 'Chưa có SĐT'})` 
        : 'Chưa có';
      return `- ${d.name}
  Mô tả: ${d.description || 'Chưa có'}
  Quản lý: ${manager}`;
    }).join('\n\n');

    // Format thông tin Sách
    const booksInfo = books.map(b => {
      const categories = b.categories && b.categories.length > 0 ? ` [${b.categories.join(', ')}]` : '';
      return `- "${b.title}"${categories}
  Mô tả: ${b.description || 'Chưa có'}
  Lượt xem: ${b.viewCount}, Lượt tải: ${b.downloadCount}`;
    }).join('\n\n');

    // Format thông tin Nhạc đạo
    const songsInfo = songs.map(s => {
      const duration = s.duration ? ` (${Math.floor(s.duration / 60)}:${(s.duration % 60).toString().padStart(2, '0')})` : '';
      const category = s.category ? ` - ${s.category}` : '';
      return `- "${s.title}"${category}${duration}
  Lượt nghe: ${s.playCount}${s.lyrics ? '\n  Có lời bài hát' : ''}`;
    }).join('\n\n');

    // Format thông tin Video
    const videosInfo = videos.map(v => {
      const category = v.category ? ` [${v.category}]` : '';
      return `- "${v.title}"${category}
  Mô tả: ${v.description || 'Chưa có'}
  Lượt xem: ${v.viewCount}`;
    }).join('\n\n');

    /* ===== PROMPT ===== */
    const prompt = `
Bạn là trợ lý ảo của Thánh Thất Trung Minh, chuyên về Đạo Cao Đài.

===== VAI TRÒ VÀ NHIỆM VỤ =====
- Bạn CHỈ trả lời các câu hỏi liên quan đến Đạo Cao Đài và Thánh Thất Trung Minh
- Từ chối lịch sự mọi câu hỏi về chính trị, tôn giáo khác, hoặc chủ đề không liên quan đến Đạo Cao Đài
- Khi từ chối, KHÔNG nói "thiếu thông tin", mà nói "xin lỗi, tôi chỉ có thể hỗ trợ thông tin về Đạo Cao Đài và Thánh Thất Trung Minh"
- Luôn trả lời bằng giọng văn lịch sự, thân thiện

===== THÔNG TIN HIỆN TẠI =====
Ngày giờ hiện tại:
- Dương lịch: ${solarDate}
- Âm lịch: ${lunarDate}

Thông tin người dùng đang chat:
${userInfo}

===== THÔNG TIN THÁNH THẤT =====
${templesInfo || 'Chưa có thông tin'}

===== SỰ KIỆN SẮP DIỄN RA / ĐANG DIỄN RA =====
${eventsInfo || 'Hiện không có sự kiện nào'}

===== CÁC BAN TRONG THÁNH THẤT =====
${departmentsInfo || 'Chưa có thông tin'}

===== THƯ VIỆN SÁCH ĐẠO =====
${booksInfo || 'Chưa có sách nào'}

===== NHẠC ĐẠO =====
${songsInfo || 'Chưa có bài hát nào'}

===== VIDEO ĐẠO =====
${videosInfo || 'Chưa có video nào'}

===== THÔNG TIN BỔ SUNG =====
${dbContext}

===== LỊCH SỬ HỘI THOẠI (Hãy nhớ những gì người dùng đã nói trước đó) =====
${historyText || 'Chưa có lịch sử chat'}

===== LƯU Ý QUAN TRỌNG =====
- Nếu được hỏi về Nguyễn Thị Thu Hà hoặc Nguyễn Võ Anh Duy, trả lời họ là người xây dựng trang web này
- Nếu người dùng hỏi về thông tin cá nhân của họ, sử dụng "Thông tin người dùng đang chat" ở trên
- Nếu người dùng hỏi về ngày giờ, sử dụng "Ngày giờ hiện tại" ở trên
- Tham khảo lịch sử hội thoại để trả lời có ngữ cảnh liên tục
- Xưng mình là "tôi", xưng user là "bạn"
- Nếu người dùng hỏi về lịch âm dương, sử dụng cả hai thông tin ngày
- Khi trả lời về sự kiện, hãy chuyển đổi thời gian từ định dạng ISO sang dạng dễ đọc cho người Việt
- Trả lời ngắn gọn, súc tích, mỗi câu trả lời không quá 200 từ

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
