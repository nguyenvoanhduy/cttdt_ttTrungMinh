import React, { useState, useRef, useEffect } from 'react';
import * as Icons from './Icons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Kính chào quý đạo hữu! Tôi là trợ lý ảo của Thánh Thất Trung Minh. Tôi có thể giúp gì cho quý vị hôm nay?',
    sender: 'bot',
    timestamp: new Date()
  }
];

const SUGGESTED_QUESTIONS = [
  "Lịch cúng hôm nay?",
  "Địa chỉ Thánh Thất?",
  "Cách đăng ký quy y?",
  "Liên hệ Ban Cai Quản?"
];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add User Message
    const userMsg: Message = {
      id: "1",
      text: text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate Bot Response
    setTimeout(() => {
      let botText = "Cảm ơn câu hỏi của quý đạo hữu. Hiện tại Ban Cai Quản đang bận, vui lòng để lại thông tin liên hệ để được giải đáp chi tiết.";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes('lịch cúng')) {
        botText = "Lịch cúng tứ thời tại Thánh Thất diễn ra vào các khung giờ: 00h (Tý), 06h (Mẹo), 12h (Ngọ), 18h (Dậu). Kính mời quý đạo hữu tham dự.";
      } else if (lowerText.includes('địa chỉ')) {
        botText = "Thánh Thất Trung Minh tọa lạc tại: Ấp An Thuận A, Xã Mỹ Thạnh An, TP. Bến Tre, Tỉnh Bến Tre.";
      } else if (lowerText.includes('liên hệ')) {
        botText = "Quý đạo hữu có thể liên hệ qua số điện thoại: 0275 3822 xxx hoặc email: vanphong@thanhthattrungminh.org";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputText);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex items-center justify-between text-white shadow-sm">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                 <Icons.Bot className="w-6 h-6 text-white" />
               </div>
               <div>
                 <h3 className="font-bold text-sm">Trợ lý ảo Trung Minh</h3>
                 <div className="flex items-center text-xs text-blue-100">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                    Đang hoạt động
                 </div>
               </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1">
               <Icons.X className="w-5 h-5" />
             </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-gray-50 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2 flex-shrink-0">
                    <Icons.Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
               <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2 flex-shrink-0">
                    <Icons.Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length < 3 && !isTyping && (
             <div className="bg-gray-50 px-4 pb-2">
                <p className="text-xs text-gray-400 mb-2 font-medium ml-1">Gợi ý câu hỏi:</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleSendMessage(q)}
                      className="whitespace-nowrap px-3 py-1.5 bg-white border border-blue-100 text-blue-600 text-xs rounded-full hover:bg-blue-50 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
             </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi..." 
                className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full px-4 py-2.5 text-sm transition-all outline-none"
              />
              <button 
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim()}
                className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Icons.Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-gray-200 text-gray-600 rotate-90' : 'bg-blue-600 text-white animate-bounce-slow'
        }`}
      >
        {isOpen ? <Icons.X className="w-6 h-6" /> : <Icons.MessageCircle className="w-7 h-7" />}
      </button>
    </div>
  );
};