
import React, { useState } from 'react';
import * as Icons from '@/components/Icons';

// Mock data for sent history
const INITIAL_HISTORY = [
    { 
        id: 'h1', 
        title: 'Thông báo Lễ Vía Đức Chí Tôn', 
        content: 'Kính mời quý đạo hữu tham dự Đại lễ vào lúc 8h00 ngày 15/01 AL. Trang phục nghiêm trang.', 
        target: 'Tất cả tín đồ', 
        channels: ['system', 'zalo'], 
        sentAt: '2024-02-20T08:00:00', 
        status: 'Đã gửi',
        recipientsCount: 1205
    },
    { 
        id: 'h2', 
        title: 'Nhắc nhở họp Ban Cai Quản', 
        content: 'Cuộc họp định kỳ tháng 3 sẽ diễn ra vào 14h00 Chủ Nhật tuần này tại phòng họp A.', 
        target: 'Ban Cai Quản', 
        channels: ['system'], 
        sentAt: '2024-02-25T09:30:00', 
        status: 'Đã gửi',
        recipientsCount: 15
    },
];

export const Notifications = () => {
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
      title: '',
      content: '',
      target: 'Tất cả tín đồ',
      enableSystem: true,
      enableZalo: false
  });

  const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      setIsSending(true);

      // Simulate API call
      setTimeout(() => {
          const newLog = {
              id: Date.now().toString(),
              title: formData.title,
              content: formData.content,
              target: formData.target,
              channels: [
                  ...(formData.enableSystem ? ['system'] : []),
                  ...(formData.enableZalo ? ['zalo'] : [])
              ],
              sentAt: new Date().toISOString(),
              status: 'Đã gửi',
              recipientsCount: formData.target === 'Tất cả tín đồ' ? 1200 : 50
          };
          
          setHistory([newLog, ...history]);
          setIsSending(false);
          setIsModalOpen(false);
          setFormData({ title: '', content: '', target: 'Tất cả tín đồ', enableSystem: true, enableZalo: false });
          alert('Đã gửi thông báo thành công!');
      }, 1500);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Thông báo</h1>
            <p className="text-gray-500 text-sm mt-1">Gửi thông báo đến tín đồ qua Hệ thống và Zalo</p>
         </div>
         <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all font-medium"
         >
            <Icons.Send className="w-4 h-4 mr-2" />
            Tạo thông báo mới
         </button>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Lịch sử gửi tin</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Icons.Filter className="w-4 h-4" />
                  <span>Lọc theo ngày</span>
              </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề / Nội dung</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Đối tượng</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kênh gửi</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {history.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <p className="text-sm font-bold text-gray-900 mb-1">{item.title}</p>
                                <p className="text-xs text-gray-500 line-clamp-1 max-w-md">{item.content}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                    <Icons.Users className="w-3 h-3 mr-1" />
                                    {item.target}
                                </span>
                                <p className="text-[10px] text-gray-400 mt-1 ml-1">{item.recipientsCount} người nhận</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex gap-2">
                                    {item.channels.includes('system') && (
                                        <span className="p-1.5 bg-gray-100 rounded text-gray-600" title="Hệ thống">
                                            <Icons.Bell className="w-4 h-4" />
                                        </span>
                                    )}
                                    {item.channels.includes('zalo') && (
                                        <span className="p-1.5 bg-blue-50 rounded text-blue-600 border border-blue-100 font-bold text-xs flex items-center" title="Zalo">
                                            Zalo
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(item.sentAt).toLocaleString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    <Icons.CheckCircle className="w-3 h-3 mr-1" />
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      </div>

      {/* --- COMPOSE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isSending && setIsModalOpen(false)}></div>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <Icons.Send className="w-5 h-5 mr-2 text-blue-600" />
                        Soạn Thông Báo Mới
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} disabled={isSending} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Icons.X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto">
                    <form id="notification-form" onSubmit={handleSend} className="space-y-6">
                        
                        {/* Target */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gửi đến</label>
                            <select 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={formData.target}
                                onChange={e => setFormData({...formData, target: e.target.value})}
                            >
                                <option value="Tất cả tín đồ">Tất cả tín đồ</option>
                                <option value="Ban Cai Quản">Ban Cai Quản</option>
                                <option value="Ban Nghi Lễ">Ban Nghi Lễ</option>
                                <option value="Thanh Niên Đạo Đức">Thanh Niên Đạo Đức</option>
                            </select>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                            <input 
                                type="text" 
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="VD: Thông báo nghỉ lễ..."
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung chi tiết</label>
                            <textarea 
                                required
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Nhập nội dung thông báo..."
                                value={formData.content}
                                onChange={e => setFormData({...formData, content: e.target.value})}
                            ></textarea>
                            <p className="text-xs text-gray-400 mt-1 text-right">{formData.content.length} ký tự</p>
                        </div>

                        {/* Channels */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Kênh gửi thông báo</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className={`
                                    flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                                    ${formData.enableSystem ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}
                                `}>
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        checked={formData.enableSystem}
                                        onChange={e => setFormData({...formData, enableSystem: e.target.checked})}
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-bold text-gray-900 flex items-center">
                                            <Icons.Bell className="w-4 h-4 mr-1.5" /> Hệ thống
                                        </span>
                                        <span className="block text-xs text-gray-500 mt-0.5">Hiển thị trên ứng dụng/web</span>
                                    </div>
                                </label>

                                <label className={`
                                    flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                                    ${formData.enableZalo ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                                `}>
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        checked={formData.enableZalo}
                                        onChange={e => setFormData({...formData, enableZalo: e.target.checked})}
                                    />
                                    <div className="ml-3">
                                        <span className="block text-sm font-bold text-blue-700 flex items-center">
                                            <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold mr-1.5">Z</span>
                                            Zalo OA
                                        </span>
                                        <span className="block text-xs text-gray-500 mt-0.5">Gửi tin nhắn trực tiếp qua Zalo</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Zalo Preview (Mock) */}
                        {formData.enableZalo && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                                <Icons.Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-bold mb-1">Lưu ý khi gửi Zalo:</p>
                                    <p>Tin nhắn sẽ được gửi từ Zalo Official Account "Thánh Thất Trung Minh". Cước phí có thể áp dụng tùy theo chính sách của Zalo OA.</p>
                                </div>
                            </div>
                        )}

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
                    <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)} 
                        disabled={isSending}
                        className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                        type="submit" 
                        form="notification-form"
                        disabled={isSending || (!formData.enableSystem && !formData.enableZalo)}
                        className={`
                            px-6 py-2.5 rounded-lg text-white font-bold shadow-lg transition-all flex items-center
                            ${isSending || (!formData.enableSystem && !formData.enableZalo)
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 hover:-translate-y-0.5'
                            }
                        `}
                    >
                        {isSending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Đang gửi...
                            </>
                        ) : (
                            <>
                                <Icons.Send className="w-4 h-4 mr-2" />
                                Gửi thông báo
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
      )}
    </div>
  );
};
