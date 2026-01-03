import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './libs/db.js';
import authRoute from './routes/authRoute.js';
import cookieParser from 'cookie-parser';
import userRoute from './routes/userRoute.js';
import { protectedRoute } from './middlewares/authMiddleware.js';
import eventRoute from './routes/eventRoute.js';
import templeRoute from './routes/templeRoute.js';
import personalRoute from './routes/personalRoute.js';
import departmentRoute from './routes/departmentRoute.js';
import songRoute from './routes/songRoute.js';
import bookRoute from './routes/bookRoute.js';
import videoRoute from './routes/videoRoute.js';
import uploadRoute from './routes/upload.js';
import chatRoute from './routes/chatRoute.js';
import eventTypeRoutes from "./routes/eventTypeRoutes.js";
import galleryRoute from './routes/galleryRoute.js';
import activityLogRoute from './routes/activityLogRoute.js';
import notificationRoute from './routes/notificationRoute.js';
import analyticsRoute from './routes/analyticsRoute.js';
import chatbotConfigRoute from './routes/chatbotConfigRoute.js';

import http from "http";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 3000;

// ===== HTTP SERVER =====
const server = http.createServer(app);

// ===== SOCKET.IO =====
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// GẮN IO VÀO APP (để controller dùng được)
app.set("io", io);

// ===== SOCKET EVENTS =====
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Admin vào phòng admin
  socket.on("join_admin", () => {
    socket.join("admin");
    console.log("Admin joined");
  });

  // User join theo session
  socket.on("join_session", (sessionId) => {
    socket.join(sessionId);
    console.log("User joined session:", sessionId);
  });

  // Admin gửi tin nhắn cho user
  socket.on("admin_send", ({ sessionId, message }) => {
    io.to(sessionId).emit("new_message", {
      sender: "Admin",
      message
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ===== MIDDLEWARE =====
const allowedOrigins = [
  "http://localhost:5173", // dev
  "https://trungminh.nvaduy.id.vn",
  "https://www.trungminh.nvaduy.id.vn",
];

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép Postman / server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// ===== PUBLIC ROUTES =====
app.use('/api/auth', authRoute);
app.use('/api/events', eventRoute);
app.use('/api/temples', templeRoute);
app.use('/api/personals', personalRoute);
app.use('/api/departments', departmentRoute);
app.use('/api/songs', songRoute);
app.use('/api/books', bookRoute);
app.use('/api/videos', videoRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/upload/content", (await import('./routes/contentUpload.js')).default);
app.use("/api/chat", chatRoute);
app.use("/api/event-types", eventTypeRoutes);
app.use("/api/gallery", galleryRoute);
app.use("/api/activity-logs", activityLogRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/chatbot-config", chatbotConfigRoute);
// ===== PRIVATE ROUTES =====
// serve uploads folder statically
import path from 'path';
app.use('/uploads', express.static(path.resolve('uploads')));

app.use(protectedRoute);
app.use('/api/users', userRoute);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server + Socket.io chạy tại cổng ${PORT}`);
  });
});
