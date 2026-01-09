/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import * as Icons from "@/components/Icons";
import { io } from "socket.io-client";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = API_BASE_URL.replace(/\/api$/, '');

const socket = io(SOCKET_URL, {
  transports: ["websocket"]
});
const API_URL = `${API_BASE_URL}/chat`;

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('accessToken') || localStorage.getItem('authToken');
};

// Create headers with auth
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const Support = () => {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<"chat" | "settings">("chat");

  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Bot config states
  const [botConfig, setBotConfig] = useState({
    isActive: true,
    name: "Trợ lý ảo Thánh Thất",
    welcomeMessage: "Xin chào! Tôi có thể giúp gì cho bạn?",
    suggestedQuestions: [
      "Địa chỉ Thánh Thất ở đâu?",
      "Lịch sinh hoạt như thế nào?",
      "Cách đăng ký tham gia sự kiện?",
    ],
    knowledgeBase: [
      { keyword: "địa chỉ", response: "Thánh Thất Trung Minh tọa lạc tại..." },
      { keyword: "giờ sinh hoạt", response: "Sinh hoạt vào Chủ nhật hàng tuần..." },
      { keyword: "đăng ký", response: "Bạn có thể đăng ký qua website hoặc liên hệ..." },
    ]
  });
  const [newQuestion, setNewQuestion] = useState("");
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  
  // Knowledge Base states
  const [editingKB, setEditingKB] = useState<{index: number; keyword: string; response: string} | null>(null);
  const [newKB, setNewKB] = useState({ keyword: "", response: "" });
  const [showKBModal, setShowKBModal] = useState(false);
  
  // Edit question state
  const [editingQuestion, setEditingQuestion] = useState<{index: number; text: string} | null>(null);

  /* ===== LOAD CHATBOT CONFIG ===== */
  useEffect(() => {
    const loadChatbotConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chatbot-config`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setBotConfig(data.data);
          }
        }
      } catch (err) {
        console.error('Error loading chatbot config:', err);
      }
    };

    loadChatbotConfig();
  }, []);

  /* ===== SAVE CHATBOT CONFIG ===== */
  const saveChatbotConfig = async () => {
    try {
      setIsSavingConfig(true);
      const response = await fetch(`${API_BASE_URL}/chatbot-config`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(botConfig),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          success('Đã lưu cấu hình chatbot thành công');
        } else {
          showError('Không thể lưu cấu hình');
        }
      } else {
        showError('Không thể lưu cấu hình');
      }
    } catch (err) {
      console.error('Error saving chatbot config:', err);
      showError('Lỗi khi lưu cấu hình chatbot');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim() && botConfig.suggestedQuestions.length < 5) {
      setBotConfig({
        ...botConfig,
        suggestedQuestions: [...botConfig.suggestedQuestions, newQuestion.trim()]
      });
      setNewQuestion("");
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setBotConfig({
      ...botConfig,
      suggestedQuestions: botConfig.suggestedQuestions.filter((_, i) => i !== index)
    });
  };

  const handleEditQuestion = (index: number) => {
    setEditingQuestion({ index, text: botConfig.suggestedQuestions[index] });
  };

  const handleSaveEditQuestion = () => {
    if (editingQuestion && editingQuestion.text.trim()) {
      const newQuestions = [...botConfig.suggestedQuestions];
      newQuestions[editingQuestion.index] = editingQuestion.text.trim();
      setBotConfig({
        ...botConfig,
        suggestedQuestions: newQuestions
      });
      setEditingQuestion(null);
    }
  };

  // Knowledge Base handlers
  const handleAddKB = () => {
    if (newKB.keyword.trim() && newKB.response.trim()) {
      setBotConfig({
        ...botConfig,
        knowledgeBase: [...botConfig.knowledgeBase, { keyword: newKB.keyword.trim(), response: newKB.response.trim() }]
      });
      setNewKB({ keyword: "", response: "" });
      setShowKBModal(false);
    }
  };

  const handleEditKB = (index: number) => {
    setEditingKB({
      index,
      keyword: botConfig.knowledgeBase[index].keyword,
      response: botConfig.knowledgeBase[index].response
    });
    setShowKBModal(true);
  };

  const handleSaveEditKB = () => {
    if (editingKB && editingKB.keyword.trim() && editingKB.response.trim()) {
      const newKB = [...botConfig.knowledgeBase];
      newKB[editingKB.index] = {
        keyword: editingKB.keyword.trim(),
        response: editingKB.response.trim()
      };
      setBotConfig({
        ...botConfig,
        knowledgeBase: newKB
      });
      setEditingKB(null);
      setShowKBModal(false);
    }
  };

  const handleDeleteKB = (index: number) => {
    setBotConfig({
      ...botConfig,
      knowledgeBase: botConfig.knowledgeBase.filter((_, i) => i !== index)
    });
  };

  const handleCloseKBModal = () => {
    setShowKBModal(false);
    setEditingKB(null);
    setNewKB({ keyword: "", response: "" });
  };

  /* ===== LOAD SESSIONS ===== */
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoading(true);
        const token = getAuthToken();
        
        const response = await fetch(`${API_URL}/sessions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setSessions(data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading sessions:', err);
        setError('Không thể tải danh sách chat. Vui lòng kiểm tra kết nối.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
    
    // Reload sessions every 30 seconds
    const interval = setInterval(loadSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ===== JOIN SESSION SOCKET ===== */
  useEffect(() => {
    if (!activeSession?._id) return;

    socket.emit("join_session", activeSession._id);
    
    return () => {
      socket.emit("leave_session", activeSession._id);
    };
  }, [activeSession]);

  /* ===== RECEIVE MESSAGE ===== */
  useEffect(() => {
    const handleReceive = (msg: any) => {
      console.log('Received message:', msg);
      setMessages(prev => [...prev, msg]);
    };

    socket.on("new_message", handleReceive);
    socket.on("receive-message", handleReceive);

    return () => {
      socket.off("new_message", handleReceive);
      socket.off("receive-message", handleReceive);
    };
  }, []);

  /* ===== LOAD MESSAGES ===== */
  const loadMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`${API_URL}/${sessionId}`);
      
      if (!res.ok) {
        throw new Error('Failed to load messages');
      }
      
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([]);
    }
  };

  /* ===== DELETE SESSION ===== */
  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      // Remove from local state
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      
      // Clear active session if it was deleted
      if (activeSession?._id === sessionId) {
        setActiveSession(null);
        setMessages([]);
      }

      setConfirmDelete(null);
      success('Đã xóa hội thoại thành công');
    } catch (err) {
      console.error('Error deleting session:', err);
      showError('Không thể xóa hội thoại. Vui lòng thử lại.');
    }
  };

  /* ===== ADMIN SEND ===== */
  const sendAdminReply = async () => {
    if (!reply.trim() || !activeSession?._id) return;

    try {
      const payload = {
        sessionId: activeSession._id,
        message: reply
      };

      const response = await fetch(`${API_URL}/admin-reply`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
      }

      // Emit to socket for real-time update
      socket.emit("send-message", {
        sessionId: activeSession._id,
        sender: "Admin",
        message: reply
      });

      // Add to local messages
      setMessages(prev => [
        ...prev,
        { 
          sender: "Admin", 
          message: reply,
          createdAt: new Date().toISOString()
        }
      ]);

      setReply("");
    } catch (err) {
      console.error('Error sending message:', err);
      showError('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  return (
    <div className="h-[calc(110vh-64px)] flex flex-col bg-gray-50 border-t">
      {/* ===== TAB ===== */}
      <div className="bg-white border-b px-6 flex gap-6">
        <button
          onClick={() => setActiveTab("chat")}
          className={`py-4 font-bold border-b-2 ${
            activeTab === "chat"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500"
          }`}
        >
          <Icons.MessageSquare className="inline w-4 h-4 mr-2" />
          Hội thoại
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`py-4 font-bold border-b-2 ${
            activeTab === "settings"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500"
          }`}
        >
          <Icons.Bot className="inline w-4 h-4 mr-2" />
          Cấu hình Chatbot
        </button>
      </div>

      {/* ===== CHAT VIEW ===== */}
      {activeTab === "chat" && (
        <div className="flex flex-1 overflow-hidden h-full">
          {/* ===== SESSION LIST ===== */}
          <div className="w-80 bg-white border-r flex flex-col h-full">
            <div className="p-4 border-b bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-700">Danh sách hội thoại</h3>
              <p className="text-xs text-gray-500 mt-1">{sessions.length} cuộc hội thoại</p>
            </div>
            <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-gray-500">Đang tải...</div>
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-red-600 bg-red-50 m-4 rounded-lg">
                {error}
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-gray-500">Chưa có hội thoại nào</div>
              </div>
            ) : (
              sessions.map(s => {
                // Try to get user info - backend may not populate fully
                const personal = s.userId?.personalId;
                const userName = personal?.fullname || s.userId?.name || s.userId?.phonenumber || `Người dùng ${s.userId?._id?.slice(-6) || ''}`;
                const userAvatar = personal?.avatarUrl;
                
                return (
                  <div
                    key={s._id}
                    onClick={() => {
                      setActiveSession(s);
                      loadMessages(s._id);
                    }}
                    className={`p-4 cursor-pointer border-b hover:bg-gray-50 ${
                      activeSession?._id === s._id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {userAvatar ? (
                        <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                          <img 
                            src={userAvatar} 
                            alt={userName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{userName}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {s.lastMessage || "Chưa có tin nhắn"}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 pl-13">
                      {new Date(s.startedAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                );
              })
            )}
            </div>
          </div>

          {/* ===== CHAT WINDOW ===== */}
          <div className="flex-1 flex flex-col">
            {!activeSession ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Icons.MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Chọn một hội thoại để bắt đầu</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-white border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const personal = activeSession.userId?.personalId;
                      const userName = personal?.fullname || activeSession.userId?.name || activeSession.userId?.phonenumber || `Người dùng ${activeSession.userId?._id?.slice(-6) || ''}`;
                      const userAvatar = personal?.avatarUrl;
                      
                      return (
                        <>
                          {userAvatar ? (
                            <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                              <img 
                                src={userAvatar} 
                                alt={userName}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                              {userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold">{userName}</div>
                            {(activeSession.userId?.email || activeSession.userId?.phonenumber || personal?.phonenumber) && (
                              <div className="text-xs text-gray-500">
                                {activeSession.userId?.email || activeSession.userId?.phonenumber || personal?.phonenumber}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadMessages(activeSession._id)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="Làm mới tin nhắn"
                    >
                      <Icons.RefreshCw className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(activeSession._id)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors"
                      title="Xóa hội thoại"
                    >
                      <Icons.Trash className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Chưa có tin nhắn
                    </div>
                  ) : (
                    messages.map((m, i) => (
                      <div
                        key={i}
                        className={`flex ${
                          m.sender === "Admin"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div className="flex flex-col max-w-lg">
                          <div
                            className={`px-4 py-2 rounded-2xl text-sm ${
                              m.sender === "Admin"
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : m.sender === "Bot"
                                ? "bg-purple-100 text-purple-900 border border-purple-200 rounded-bl-sm"
                                : "bg-white border border-gray-200 rounded-bl-sm"
                            }`}
                          >
                            {m.message}
                          </div>
                          {m.createdAt && (
                            <div className={`text-xs text-gray-400 mt-1 ${
                              m.sender === "Admin" ? "text-right" : "text-left"
                            }`}>
                              {new Date(m.createdAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 bg-white border-t flex gap-3">
                  <input
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && sendAdminReply()}
                    placeholder="Nhập phản hồi..."
                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={sendAdminReply}
                    disabled={!reply.trim()}
                    className="bg-blue-600 text-white rounded-full px-6 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icons.Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Cấu hình Chatbot</h2>
                <p className="text-gray-500 mt-1">Quản lý nội dung và kịch bản trả lời tự động</p>
              </div>
              <button 
                onClick={saveChatbotConfig}
                disabled={isSavingConfig}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingConfig ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Icons.CheckCircle className="w-4 h-4 mr-2" />
                    Lưu cấu hình
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - General Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* General Settings Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Icons.Bot className="w-5 h-5 mr-2 text-blue-500" />
                    Thông tin chung
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <label className="font-bold text-gray-700 block">Trạng thái hoạt động</label>
                        <span className="text-sm text-gray-500">Bật/Tắt chatbot trên trang công khai</span>
                      </div>
                      <button
                        onClick={() => setBotConfig({...botConfig, isActive: !botConfig.isActive})}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          botConfig.isActive ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            botConfig.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tên hiển thị</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={botConfig.name}
                        onChange={(e) => setBotConfig({...botConfig, name: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lời chào mở đầu</label>
                      <textarea 
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={botConfig.welcomeMessage}
                        onChange={(e) => setBotConfig({...botConfig, welcomeMessage: e.target.value})}
                      ></textarea>
                      <p className="text-xs text-gray-400 mt-1 text-right">Hiển thị khi người dùng mở cửa sổ chat</p>
                    </div>
                  </div>
                </div>

                {/* Knowledge Base Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <Icons.BookOpen className="w-5 h-5 mr-2 text-amber-500" />
                      Kịch bản trả lời (Knowledge Base)
                    </div>
                    <button 
                      onClick={() => setShowKBModal(true)}
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      <Icons.Plus className="w-4 h-4 mr-1" />
                      Thêm mới
                    </button>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Từ khóa (Keyword)</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Câu trả lời mẫu</th>
                          <th className="px-4 py-3 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {botConfig.knowledgeBase.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">
                              Chưa có kịch bản trả lời nào. Nhấn "Thêm mới" để bắt đầu.
                            </td>
                          </tr>
                        ) : (
                          botConfig.knowledgeBase.map((kb, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-700">
                                {kb.keyword}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {kb.response}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => handleEditKB(idx)}
                                    className="text-gray-400 hover:text-blue-500 transition-colors"
                                    title="Chỉnh sửa"
                                  >
                                    <Icons.Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteKB(idx)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Xóa"
                                  >
                                    <Icons.Trash className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column - Suggestions */}
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Icons.MessageCircle className="w-5 h-5 mr-2 text-green-500" />
                    Gợi ý câu hỏi
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Các câu hỏi nhanh hiển thị cho người dùng chọn.</p>
                  
                  <div className="space-y-3 mb-6">
                    {botConfig.suggestedQuestions.map((q, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg group hover:border-blue-200 transition-colors">
                        {editingQuestion?.index === idx ? (
                          <input
                            type="text"
                            value={editingQuestion.text}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleSaveEditQuestion();
                              if (e.key === 'Escape') setEditingQuestion(null);
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm text-gray-700">{q}</span>
                        )}
                        <div className="flex items-center gap-1 ml-2">
                          {editingQuestion?.index === idx ? (
                            <>
                              <button 
                                onClick={handleSaveEditQuestion}
                                className="text-green-500 hover:text-green-600 p-1"
                                title="Lưu"
                              >
                                <Icons.CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setEditingQuestion(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                                title="Hủy"
                              >
                                <Icons.X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleEditQuestion(idx)}
                                className="text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                title="Chỉnh sửa"
                              >
                                <Icons.Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleRemoveQuestion(idx)}
                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                title="Xóa"
                              >
                                <Icons.Trash className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Thêm câu hỏi mới..." 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
                    />
                    <button 
                      onClick={handleAddQuestion}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Icons.Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                    <Icons.Info className="w-4 h-4 mr-2" />
                    Mẹo cấu hình
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                    <li>Lời chào nên ngắn gọn và thân thiện.</li>
                    <li>Thêm từ khóa phổ biến để bot tự động trả lời nhanh.</li>
                    <li>Tối đa 5 câu hỏi gợi ý để giao diện không bị rối.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ===== 
                KNOWLEDGE BASE MODAL ===== */}
      {showKBModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold mb-4">
              {editingKB ? 'Chỉnh sửa kịch bản' : 'Thêm kịch bản mới'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ khóa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: địa chỉ, giờ sinh hoạt..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={editingKB ? editingKB.keyword : newKB.keyword}
                  onChange={(e) => editingKB 
                    ? setEditingKB({ ...editingKB, keyword: e.target.value })
                    : setNewKB({ ...newKB, keyword: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Câu trả lời <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập câu trả lời mẫu cho từ khóa này..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={editingKB ? editingKB.response : newKB.response}
                  onChange={(e) => editingKB 
                    ? setEditingKB({ ...editingKB, response: e.target.value })
                    : setNewKB({ ...newKB, response: e.target.value })
                  }
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseKBModal}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={editingKB ? handleSaveEditKB : handleAddKB}
                disabled={editingKB 
                  ? !editingKB.keyword.trim() || !editingKB.response.trim()
                  : !newKB.keyword.trim() || !newKB.response.trim()
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingKB ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====           onClick={() => handleRemoveQuestion(idx)}
                          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Icons.X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Thêm câu hỏi mới..." 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddQuestion()}
                    />
                    <button 
                      onClick={handleAddQuestion}
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Icons.Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                    <Icons.Info className="w-4 h-4 mr-2" />
                    Mẹo cấu hình
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                    <li>Lời chào nên ngắn gọn và thân thiện.</li>
                    <li>Thêm từ khóa phổ biến để bot tự động trả lời nhanh.</li>
                    <li>Tối đa 5 câu hỏi gợi ý để giao diện không bị rối.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ===== CONFIRM DELETE MODAL ===== */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold mb-2">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa hội thoại này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => deleteSession(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
