import Event from "../models/Event.js";
import Temple from "../models/Temple.js";
import Book from "../models/Book.js";
import Song from "../models/Song.js";
import { readPdfFromUrl } from "./pdfService.js";

/**
 * Lấy context từ database để AI trả lời
 */
export const getThanhThatContext = async () => {
  /* ===== TEMPLE ===== */
  const temple = await Temple.findOne().lean();

  /* ===== EVENTS (3 sự kiện sắp tới) ===== */
  const events = await Event.find({
    status: "Sắp diễn ra"
  })
    .sort({ startTime: 1 })
    .limit(3)
    .lean();

  /* ===== BOOKS ===== */
  const books = await Book.find({ status: "active" })
    .limit(3)
    .lean();

  /* ===== SONGS ===== */
  const songs = await Song.find({ status: "active" })
    .limit(3)
    .lean();

  /* ===== BUILD CONTEXT TEXT ===== */
  let context = "";

  if (temple) {
    context += `
Thông tin Thánh Thất:
- Tên: ${temple.name}
- Địa chỉ: ${temple.address}
- Giới thiệu: ${temple.description || "Chưa cập nhật"}
`;
  }

  if (events.length > 0) {
    context += `\nSự kiện sắp diễn ra:\n`;
    events.forEach((e, i) => {
      context += `${i + 1}. ${e.name} (${new Date(e.startTime).toLocaleDateString("vi-VN")}) tại ${e.location}\n`;
    });
  }

  if (books.length > 0) {
    context += `\nGiáo lý / Tài liệu:\n`;
    books.forEach((b, i) => {
      context += `${i + 1}. ${b.title}\n`;
    });
  }

  if (songs.length > 0) {
    context += `\nThánh ca:\n`;
    songs.forEach((s, i) => {
      context += `${i + 1}. ${s.title}\n`;
    });
  }
  if (books.length > 0) {
  context += `\nNội dung giáo lý:\n`;

  for (const book of books) {
    try {
      const pdfText = await readPdfFromUrl(book.fileUrl);
      context += `
        Sách: ${book.title}
        ${pdfText}
        `;
        break; // chỉ lấy 1 quyển đầu
      } catch (e) {
        console.log("PDF read error:", book.title);
      }
    }
  }

  return context;
};
