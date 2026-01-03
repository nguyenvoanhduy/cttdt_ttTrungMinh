/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import * as Icons from "@/components/Icons";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import { notificationService, type Notification } from "@/services/notificationService";
import { departmentService, type Department } from "@/services/departmentService";

export const Notifications = () => {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [history, setHistory] = useState<Notification[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetGroups: ["Tất cả tín đồ"] as string[],
    type: "system" as "event" | "system" | "chat" | "family" | "media" | "other",
  });

  // Fetch notifications and departments on mount
  useEffect(() => {
    fetchNotifications();
    fetchDepartments();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response: any = await notificationService.getAll();
      const notifs = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setHistory(Array.isArray(notifs) ? notifs : []);
    } catch (err: any) {
      showError(err.response?.data?.message || "Không thể tải danh sách thông báo");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      setDepartments(response.data?.data || []);
    } catch (err: any) {
      console.error("Không thể tải danh sách ban:", err);
    }
  };

  const toggleTargetGroup = (group: string) => {
    setFormData(prev => {
      let newGroups = [...prev.targetGroups];
      
      if (group === "Tất cả tín đồ") {
        // Nếu chọn "Tất cả", bỏ hết các group khác
        newGroups = newGroups.includes(group) ? [] : [group];
      } else {
        // Nếu chọn ban cụ thể, bỏ "Tất cả"
        newGroups = newGroups.filter(g => g !== "Tất cả tín đồ");
        
        if (newGroups.includes(group)) {
          newGroups = newGroups.filter(g => g !== group);
        } else {
          newGroups.push(group);
        }
      }
      
      return { ...prev, targetGroups: newGroups };
    });
  };

  // Filter Logic
  const filteredHistory = Array.isArray(history) ? history.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.targetGroups.length === 0) {
      showError("Vui lòng chọn ít nhất một đối tượng");
      return;
    }
    
    setIsSending(true);

    try {
      await notificationService.create({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        targetGroups: formData.targetGroups,
      });

      await fetchNotifications();
      setIsModalOpen(false);
      setFormData({
        title: "",
        message: "",
        targetGroups: ["Tất cả tín đồ"],
        type: "system",
      });
      success("Đã gửi thông báo thành công!");
    } catch (err: any) {
      showError(err.response?.data?.message || "Không thể gửi thông báo");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý Thông báo
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gửi thông báo đến tín đồ qua Hệ thống và Zalo
          </p>
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
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-gray-700">Lịch sử gửi tin</h3>
          <div className="flex gap-4 items-center w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons.Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm thông báo..."
                className="block w-full sm:w-64 pl-9 pr-3 py-1.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
              <Icons.Filter className="w-4 h-4" />
              <span>Lọc theo ngày</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tiêu đề / Nội dung
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Đối tượng
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Loại thông báo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-500">Đang tải...</p>
                  </td>
                </tr>
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900 mb-1">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1 max-w-md">
                        {item.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.targetGroups && item.targetGroups.length > 0 ? (
                          item.targetGroups.map((group, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                            >
                              {group}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">Không xác định</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.recipientCount || 0} người nhận
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          title={item.type}
                        >
                          <Icons.Bell className="w-3 h-3 mr-1" />
                          {item.type === "system" ? "Hệ thống" : 
                           item.type === "event" ? "Sự kiện" :
                           item.type === "chat" ? "Trò chuyện" :
                           item.type === "family" ? "Gia phả" :
                           item.type === "media" ? "Thư viện" : "Khác"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <Icons.CheckCircle className="w-3 h-3 mr-1" />
                        Đã gửi
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không tìm thấy kết quả phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- COMPOSE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isSending && setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Icons.Send className="w-5 h-5 mr-2 text-blue-600" />
                Soạn Thông Báo Mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSending}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto">
              <form
                id="notification-form"
                onSubmit={handleSend}
                className="space-y-6"
              >
                {/* Target Groups - Multi-select with checkboxes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gửi đến <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2 p-4 border border-gray-300 rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                    {/* Tất cả tín đồ */}
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.targetGroups.includes("Tất cả tín đồ")}
                        onChange={() => toggleTargetGroup("Tất cả tín đồ")}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Tất cả tín đồ</span>
                    </label>
                    
                    {/* Gợi ý khi đã chọn "Tất cả" */}
                    {formData.targetGroups.includes("Tất cả tín đồ") && (
                      <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <Icons.Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Bỏ chọn "Tất cả tín đồ" để chọn các ban riêng lẻ</span>
                      </div>
                    )}
                    
                    {/* Các ban từ database */}
                    {departments.map(dept => (
                      <label key={dept._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.targetGroups.includes(dept.name)}
                          onChange={() => toggleTargetGroup(dept.name)}
                          disabled={formData.targetGroups.includes("Tất cả tín đồ")}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`text-sm ${formData.targetGroups.includes("Tất cả tín đồ") ? "text-gray-400" : "text-gray-700"}`}>
                          {dept.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Đã chọn: {formData.targetGroups.length > 0 ? formData.targetGroups.join(", ") : "Chưa chọn"}
                  </p>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại thông báo
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                  >
                    <option value="system">Hệ thống</option>
                    <option value="event">Sự kiện</option>
                    <option value="chat">Trò chuyện</option>
                    <option value="family">Gia phả</option>
                    <option value="media">Thư viện</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="VD: Thông báo nghỉ lễ..."
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung chi tiết
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Nhập nội dung thông báo..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  ></textarea>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {formData.message.length} ký tự
                  </p>
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                  <Icons.Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">Lưu ý:</p>
                    <p>
                      Thông báo sẽ được hiển thị ngay trên website. 
                      Người dùng sẽ nhận được thông báo trong phần chuông thông báo.
                    </p>
                  </div>
                </div>
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
                disabled={isSending}
                className={`
                            px-6 py-2.5 rounded-lg text-white font-bold shadow-lg transition-all flex items-center
                            ${
                              isSending
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 hover:-translate-y-0.5"
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

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
