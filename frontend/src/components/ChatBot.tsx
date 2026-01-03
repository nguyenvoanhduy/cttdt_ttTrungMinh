/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import * as Icons from "./Icons";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

/* ================= CONFIG ================= */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${API_BASE_URL}/chat`;
// Extract base URL without /api for socket connection
const SOCKET_URL = API_BASE_URL.replace('/api', '');

console.log('[ChatBot] API_BASE_URL:', API_BASE_URL);
console.log('[ChatBot] SOCKET_URL:', SOCKET_URL);

const socket: Socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true
});

/* ================= TYPES ================= */
interface Message {
  id: string;
  text: string;
  sender: "user" | "bot" | "admin";
  timestamp: Date;
}

/* ================= INIT DATA ================= */
const INITIAL_MESSAGES: Message[] = [
  {
    id: "init",
    text:
      "Kính chào quý đạo hữu! Tôi là trợ lý ảo của Thánh Thất Trung Minh. Tôi có thể giúp gì cho quý vị hôm nay?\n\n💡 Gõ /admin để chat trực tiếp với nhân viên hỗ trợ.",
    sender: "bot",
    timestamp: new Date()
  }
];

/* ================= COMPONENT ================= */
export const Chatbot = () => {
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "/admin - Hỗ trợ trực tiếp",
    "Địa chỉ Thánh Thất?",
    "Liên hệ Ban Cai Quản?",
  ]);
  const [botConfig, setBotConfig] = useState({
    isActive: true,
    name: "Trợ lý ảo Thánh Thất",
    welcomeMessage: "Kính chào quý đạo hữu! Tôi là trợ lý ảo của Thánh Thất Trung Minh.",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ===== LOAD CHATBOT CONFIG ===== */
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chatbot-config`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setBotConfig({
              isActive: data.data.isActive,
              name: data.data.name,
              welcomeMessage: data.data.welcomeMessage,
            });
            
            // Cập nhật suggested questions từ config
            if (data.data.suggestedQuestions && data.data.suggestedQuestions.length > 0) {
              setSuggestedQuestions([
                "/admin - Hỗ trợ trực tiếp",
                ...data.data.suggestedQuestions
              ]);
            }

            // Cập nhật tin nhắn chào mừng
            setMessages([{
              id: "init",
              text: `${data.data.welcomeMessage}\n\n💡 Gõ /admin để chat trực tiếp với nhân viên hỗ trợ.`,
              sender: "bot",
              timestamp: new Date()
            }]);
          }
        }
      } catch (err) {
        console.error('Error loading chatbot config:', err);
      }
    };

    loadConfig();
  }, []);

  /* ===== SCROLL ===== */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  /* ===== SOCKET JOIN (khi có sessionId) ===== */
  useEffect(() => {
    if (currentSessionId) {
      socket.emit("join_session", currentSessionId);
      console.log('Joined session:', currentSessionId);
    }
    
    return () => {
      if (currentSessionId) {
        socket.emit("leave_session", currentSessionId);
      }
    };
  }, [currentSessionId]);

  /* ===== RECEIVE ADMIN MESSAGE ===== */
  useEffect(() => {
    const handleReceiveMessage = (msg: any) => {
      console.log('Received message:', msg);
      if (msg.sender === "Admin") {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            text: msg.message,
            sender: "admin",
            timestamp: new Date()
          }
        ]);
        setIsTyping(false);
      }
    };

    socket.on("new_message", handleReceiveMessage);
    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("new_message", handleReceiveMessage);
      socket.off("receive-message", handleReceiveMessage);
    };
  }, []);

  /* ===== SEND USER MESSAGE ===== */
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Check if user is logged in
    if (!user) {
      const userMsg: Message = {
        id: Date.now().toString(),
        text,
        sender: "user",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMsg]);
      setInputText("");
      
      // Show login required message
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "⚠️ Bạn cần đăng nhập để sử dụng dịch vụ chat. Vui lòng đăng nhập tại trang Đăng nhập.",
            sender: "bot",
            timestamp: new Date()
          }
        ]);
      }, 500);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Check if user wants admin support
    if (text.trim().toLowerCase() === '/admin') {
      setIsAdminMode(true);
    }

    try {
      const res = await fetch(`${API_URL}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || null,
          message: text
        })
      });

      const data = await res.json();

      // Lưu sessionId server trả về
      if (data.sessionId) {
        setCurrentSessionId(data.sessionId);
      }

      // Check if admin mode
      if (text.trim().toLowerCase() === '/admin') {
        setIsAdminMode(true);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            text: "✅ Bạn đã được kết nối với nhân viên hỗ trợ. Vui lòng chờ trong giây lát...",
            sender: "bot",
            timestamp: new Date()
          }
        ]);
        setIsTyping(false);
        return;
      }

      // Hiện bot reply
      if (data.reply) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            text: data.reply,
            sender: "bot",
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "⚠️ Có lỗi xảy ra, vui lòng thử lại",
          sender: "bot",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-[360px] h-[520px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden">
          {/* HEADER */}
          <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                {isAdminMode ? <Icons.Users className="w-5 h-5" /> : <Icons.Bot className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {isAdminMode ? "Hỗ trợ trực tiếp" : botConfig.name}
                </h3>
                <p className="text-xs text-blue-100 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                  {isAdminMode ? "Đang kết nối với admin" : "Đang hoạt động"}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <Icons.X className="w-5 h-5" />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 bg-gray-50 p-4 space-y-4 overflow-y-auto">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {(msg.sender === "bot" || msg.sender === "admin") && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    msg.sender === "admin" ? "bg-green-100" : "bg-blue-100"
                  }`}>
                    {msg.sender === "admin" ? (
                      <Icons.Users className="w-4 h-4 text-green-600" />
                    ) : (
                      <Icons.Bot className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                )}
                <div className="flex flex-col">
                  {msg.sender === "admin" && (
                    <span className="text-xs text-gray-500 mb-1 ml-1">Admin hỗ trợ</span>
                  )}
                  <div  
                    className={`px-4 py-2 rounded-2xl text-sm max-w-[100%] ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : msg.sender === "admin"
                        ? "bg-green-100 border border-green-300 rounded-tl-none"
                        : "bg-white border rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <Icons.Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-white border rounded-2xl px-4 py-2 text-sm">
                  Bot đang trả lời...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SUGGEST */}
          {messages.length <= 2 && (
            <div className="bg-gray-50 px-4 pb-3">
              <p className="text-xs text-gray-400 mb-2">Gợi ý:</p>

              <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    className="px-3 py-1 text-xs bg-white border rounded-full text-blue-600 hover:bg-blue-50 shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* INPUT */}
          <div className="p-4 bg-white border-t flex gap-2">
            <input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  handleSendMessage(inputText);
                }
              }}
              placeholder="Nhập câu hỏi..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none"
            />
            <button
              disabled={!inputText.trim()}
              onClick={() => handleSendMessage(inputText)}
              className="bg-blue-600 text-white rounded-full px-4 disabled:bg-gray-300"
            >
              <Icons.Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TOGGLE */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center"
      >
        {isOpen ? <Icons.X /> : <Icons.MessageCircle />}
      </button>
    </div>
  );
};
