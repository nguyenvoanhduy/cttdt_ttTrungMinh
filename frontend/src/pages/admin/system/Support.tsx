
import React, { useState } from 'react';
import * as Icons from '@/components/Icons';

// Hardcoded chat mock for UI
const CHAT_SESSIONS = [
    { id: '1', user: 'Nguyễn Văn A', lastMsg: 'Cần hỗ trợ đăng ký lễ...', time: '10:30', unread: 2 },
    { id: '2', user: 'Lê Thị B', lastMsg: 'Cảm ơn admin.', time: 'Hôm qua', unread: 0 },
    { id: '3', user: 'Trần Văn C', lastMsg: 'Cho hỏi về lịch cúng...', time: 'Hôm kia', unread: 0 },
];

export const Support = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');

  // --- SETTINGS STATE ---
  const [botConfig, setBotConfig] = useState({
    name: 'Trợ lý ảo Trung Minh',
    welcomeMessage: 'Kính chào quý đạo hữu! Tôi là trợ lý ảo của Thánh Thất Trung Minh. Tôi có thể giúp gì cho quý vị hôm nay?',
    isActive: true,
    suggestedQuestions: [
      "Lịch cúng hôm nay?",
      "Địa chỉ Thánh Thất?",
      "Cách đăng ký quy y?",
      "Liên hệ Ban Cai Quản?"
    ],
    knowledgeBase: [
        { keyword: 'lịch cúng', response: 'Lịch cúng tứ thời diễn ra vào 00h (Tý), 06h (Mẹo), 12h (Ngọ), 18h (Dậu).' },
        { keyword: 'địa chỉ', response: 'Thánh Thất tọa lạc tại Ấp An Thuận A, Xã Mỹ Thạnh An, TP. Bến Tre.' },
        { keyword: 'liên hệ', response: 'SĐT: 0275 3822 xxx hoặc Email: vanphong@thanhthattrungminh.org' }
    ]
  });

  const [newQuestion, setNewQuestion] = useState('');

  const handleAddQuestion = () => {
      if (newQuestion.trim()) {
          setBotConfig({...botConfig, suggestedQuestions: [...botConfig.suggestedQuestions, newQuestion]});
          setNewQuestion('');
      }
  };

  const handleRemoveQuestion = (idx: number) => {
      const newQuestions = [...botConfig.suggestedQuestions];
      newQuestions.splice(idx, 1);
      setBotConfig({...botConfig, suggestedQuestions: newQuestions});
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50 border-t border-gray-200">
        
        {/* --- TAB NAVIGATION --- */}
        <div className="bg-white border-b border-gray-200 px-6 flex items-center gap-8 shrink-0">
             <button 
                onClick={() => setActiveTab('chat')}
                className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'chat' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
             >
                <Icons.MessageSquare className="w-4 h-4" />
                Hội thoại trực tuyến
                <span className="bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs ml-1">2</span>
             </button>
             <button 
                onClick={() => setActiveTab('settings')}
                className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === 'settings' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
             >
                <Icons.Bot className="w-4 h-4" />
                Cấu hình Chatbot
             </button>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 overflow-hidden relative">
            
            {/* VIEW 1: CHAT INTERFACE */}
            {activeTab === 'chat' && (
                <div className="absolute inset-0 flex">
                    {/* Left Sidebar - Chat List */}
                    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
                        <div className="p-4 border-b border-gray-100 shrink-0">
                            <div className="relative">
                                <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="Tìm kiếm hội thoại..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {CHAT_SESSIONS.map(chat => (
                                <div key={chat.id} className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors ${chat.id === '1' ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`font-medium text-sm ${chat.id === '1' ? 'text-blue-900' : 'text-gray-900'}`}>{chat.user}</span>
                                        <span className="text-xs text-gray-400">{chat.time}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-gray-500 truncate w-40">{chat.lastMsg}</p>
                                        {chat.unread > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{chat.unread}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Content - Chat Window */}
                    <div className="flex-1 flex flex-col bg-gray-50 h-full">
                        {/* Header */}
                        <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600 flex items-center justify-center font-bold mr-3 border border-gray-100">
                                    A
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">Nguyễn Văn A</h3>
                                    <p className="text-xs text-green-500 flex items-center font-medium">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                        Đang trực tuyến
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                    <Icons.Phone className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                    <Icons.MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="flex justify-center">
                                <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">Hôm nay, 10:30</span>
                            </div>
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-5 py-3 text-sm text-gray-700 shadow-sm max-w-lg">
                                    Chào Ban Quản Trị, tôi muốn hỏi về lịch cúng tuần này? Tôi muốn đăng ký tham gia cúng đàn tối nay được không ạ?
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-5 py-3 text-sm shadow-md max-w-lg">
                                    Chào đạo hữu, lịch cúng tuần này vẫn diễn ra vào 19h00 hằng ngày tại Bửu Điện ạ. Đạo hữu có thể đến trước 15 phút để chuẩn bị lễ phục nhé.
                                </div>
                            </div>
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-5 py-3 text-sm text-gray-700 shadow-sm max-w-lg">
                                    Cảm ơn nhiều! Tôi sẽ đến đúng giờ.
                                </div>
                            </div>
                             <div className="flex justify-end">
                                <span className="text-xs text-gray-400 mr-2">Đã xem</span>
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                            <div className="flex items-center gap-3">
                                <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                                    <Icons.Paperclip className="w-5 h-5" />
                                </button>
                                <input 
                                    type="text" 
                                    placeholder="Nhập tin nhắn..." 
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                                />
                                <button className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-105">
                                    <Icons.Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW 2: SETTINGS INTERFACE */}
            {activeTab === 'settings' && (
                <div className="absolute inset-0 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto space-y-8">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Cấu hình Chatbot</h2>
                                <p className="text-gray-500 mt-1">Quản lý nội dung và kịch bản trả lời tự động</p>
                            </div>
                            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm font-medium">
                                <Icons.CheckCircle className="w-4 h-4 mr-2" />
                                Lưu cấu hình
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
                                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input type="checkbox" name="toggle" id="toggle" checked={botConfig.isActive} onChange={(e) => setBotConfig({...botConfig, isActive: e.target.checked})} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-blue-600"/>
                                                <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${botConfig.isActive ? 'bg-blue-600' : 'bg-gray-300'}`}></label>
                                            </div>
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
                                        <button className="text-sm text-blue-600 hover:underline">Thêm mới</button>
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
                                                {botConfig.knowledgeBase.map((kb, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-700">
                                                            {kb.keyword}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {kb.response}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button className="text-gray-400 hover:text-red-500"><Icons.Trash className="w-4 h-4" /></button>
                                                        </td>
                                                    </tr>
                                                ))}
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
                                                <span className="text-sm text-gray-700">{q}</span>
                                                <button 
                                                    onClick={() => handleRemoveQuestion(idx)}
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
        </div>
    </div>
  );
};
