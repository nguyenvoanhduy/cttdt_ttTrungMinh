/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import * as Icons from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Gender, type Temple, type TempleHistoryEntry } from "../types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/Toast";

export const UserProfilePage = () => {
  const { user, personal, isAuthenticated, isLoading, updatePersonal, uploadAvatar } =
    useAuth();
  const { toasts, removeToast, success, error, warning } = useToast();

  // ✅ FIX: temples phải là mảng Temple
  const [temples, setTemples] = useState<Temple[]>([]);

  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">(
    "idle"
  );
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [newHistory, setNewHistory] = useState<Partial<TempleHistoryEntry>>({});
  const [templesLoading, setTemplesLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ================= FETCH TEMPLES ================= */
  useEffect(() => {
    const fetchTemples = async () => {
      try {
        setTemplesLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const res = await fetch(`${API_BASE_URL}/temples`);
        if (!res.ok) {
          throw new Error("Failed to fetch temples");
        }
        const data: Temple[] = await res.json();
        setTemples(data);
        console.log("Đã tải", data.length, "thánh thất từ database");
      } catch (err) {
        console.error("Lỗi load temples:", err);
        error("Không thể tải danh sách thánh thất");
      } finally {
        setTemplesLoading(false);
      }
    };
    fetchTemples();
  }, []);

  /* ================= INIT FORM ================= */
  useEffect(() => {
    if (personal && user) {
      setFormData({
        fullname: personal.fullname || "",
        gender: personal.gender || Gender.OTHER,
        dateOfBirth: personal.dateOfBirth
          ? new Date(personal.dateOfBirth)
          : null,
        address: personal.address || "",
        email: personal.email || "",
        phoneNumber: user.phonenumber || "",
        templeHistory: personal.templeHistory || [],
      });
    }
  }, [personal, user]);

  // Hiển thị loading trong khi kiểm tra authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /* ================= VALIDATION ================= */
  const validateForm = (): boolean => {
    // Kiểm tra họ tên
    if (!formData.fullname || formData.fullname.trim() === "") {
      error("Vui lòng nhập họ và tên");
      return false;
    }

    if (formData.fullname.trim().length < 2) {
      error("Họ và tên phải có ít nhất 2 ký tự");
      return false;
    }

    // Kiểm tra email
    if (formData.email && formData.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        error("Email không hợp lệ. Vui lòng nhập email có dạng example@domain.com");
        return false;
      }
    }

    // Kiểm tra ngày sinh
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      
      if (birthDate > today) {
        error("Ngày sinh không thể là ngày trong tương lai");
        return false;
      }

      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 150) {
        error("Ngày sinh không hợp lệ");
        return false;
      }
    }

    // Kiểm tra địa chỉ
    if (formData.address && formData.address.trim().length > 500) {
      error("Địa chỉ quá dài. Vui lòng nhập tối đa 500 ký tự");
      return false;
    }

    return true;
  };

  /* ================= SAVE PROFILE ================= */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setSaveStatus("saving");

      await updatePersonal({
        fullname: formData.fullname,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth
          ? formData.dateOfBirth.toISOString()
          : null,
        address: formData.address,
        email: formData.email,
        templeHistory: formData.templeHistory,
      });

      setSaveStatus("success");
      setIsEditing(false);
      success("✓ Cập nhật thông tin thành công!");
      
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setSaveStatus("idle");
      error("✗ Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  /* ================= AVATAR ================= */
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      error("Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF, WEBP)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error("Kích thước ảnh không được vượt quá 10MB");
      return;
    }

    try {
      setUploadStatus("uploading");
      const formDataUpload = new FormData();
      formDataUpload.append("avatar", file);

      await uploadAvatar(formDataUpload);
      setUploadStatus("success");
      success("✓ Cập nhật ảnh đại diện thành công!");
      setTimeout(() => setUploadStatus("idle"), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
      error("✗ Lỗi khi tải ảnh lên. Vui lòng thử lại!");
      setTimeout(() => setUploadStatus("idle"), 3000);
    }
  };

  /* ================= TEMPLE HISTORY ================= */
  const handleAddHistory = () => {
    if (newHistory.templeId && newHistory.startDate) {
      const entry: TempleHistoryEntry = {
        templeId: newHistory.templeId,
        startDate: newHistory.startDate,
        endDate: newHistory.endDate,
        role: newHistory.role,
      };

      setFormData((prev: any) => ({
        ...prev,
        templeHistory: [entry, ...(prev.templeHistory || [])],
      }));

      setNewHistory({});
    }
  };

  const handleRemoveHistory = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      templeHistory: prev.templeHistory.filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  /* ================= RENDER ================= */
  return (
    <div className="animate-in fade-in duration-500 bg-gray-100 min-h-screen pb-12">
      {/* Header Background */}
      <div className="h-48 bg-gradient-to-r from-blue-900 to-blue-700 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      <div className="container mx-auto px-6 -mt-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT COLUMN: Avatar & Quick Info */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 text-center border-b border-gray-100">
                <div className="relative inline-block mb-4 group">
                  <img
                    src={
                      personal?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${personal?.fullname}&background=0D8ABC&color=fff`
                    }
                    className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
                    alt="Avatar"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploadStatus === "uploading"}
                    className="absolute bottom-1 right-1 p-2 bg-gray-800 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
                    title="Thay đổi ảnh đại diện"
                  >
                    <Icons.Camera className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-gray-900">{personal?.fullname}</h2>
                <p className="text-blue-600 font-medium">{personal?.position || "Tín đồ"}</p>
                
                <div className="mt-4 flex justify-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${personal?.status === 'Đang hoạt động' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {personal?.status || 'Đang hoạt động'}
                  </span>
                </div>

                {uploadStatus === "uploading" && (
                  <p className="text-sm text-blue-600 mt-3">Đang tải lên...</p>
                )}
                {uploadStatus === "success" && (
                  <p className="text-sm text-green-600 mt-3">Cập nhật thành công!</p>
                )}
                {uploadStatus === 'error' && (
                  <p className="text-sm text-red-600 mt-3">Lỗi tải ảnh lên</p>
                )}
              </div>

              <div className="p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Icons.Info className="w-4 h-4 mr-2 text-blue-500" />
                  Thông tin liên hệ
                </h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Icons.Phone className="w-4 h-4 mr-3 text-gray-400" />
                    {user?.phonenumber}
                  </li>
                  <li className="flex items-center">
                    <Icons.Mail className="w-4 h-4 mr-3 text-gray-400" />
                    {formData.email || 'Chưa cập nhật email'}
                  </li>
                  <li className="flex items-start">
                    <Icons.MapPin className="w-4 h-4 mr-3 mt-0.5 text-gray-400" />
                    {personal?.address || 'Chưa cập nhật địa chỉ'}
                  </li>
                </ul>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:text-blue-600 hover:border-blue-400 transition-colors flex items-center justify-center shadow-sm"
                  >
                    <Icons.Edit className="w-4 h-4 mr-2" /> Chỉnh sửa hồ sơ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Detailed Form */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Icons.User className="w-6 h-6 mr-2 text-blue-600" />
                  Thông tin cá nhân
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center transition-colors hover:text-blue-600 hover:border-blue-300"
                  >
                    <Icons.Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
                  </button>
                ) : (
                  <button
                    onClick={() => { setIsEditing(false); setSaveStatus('idle'); }}
                    className="px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center"
                  >
                    <Icons.X className="w-4 h-4 mr-2" /> Hủy bỏ
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên Thánh <span className="text-red-500">*</span>
                  </label>
                  <input
                    disabled={!isEditing}
                    value={formData.fullname || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullname: e.target.value,
                      })
                    }
                    placeholder="Nhập họ và tên"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    disabled={true}
                    value={formData.phoneNumber || ""}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    disabled={!isEditing}
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    placeholder="ten@gmail.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <DatePicker
                    selected={formData.dateOfBirth}
                    onChange={(date: Date | null) =>
                      setFormData({
                        ...formData,
                        dateOfBirth: date,
                      })
                    }
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/MM/yyyy"
                    disabled={!isEditing}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    maxDate={new Date()}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    disabled={!isEditing}
                    value={formData.gender || Gender.OTHER}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all outline-none bg-white"
                  >
                    <option value={Gender.MALE}>Nam</option>
                    <option value={Gender.FEMALE}>Nữ</option>
                    <option value={Gender.OTHER}>Khác</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ hiện tại
                  </label>
                  <textarea
                    rows={3}
                    disabled={!isEditing}
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: e.target.value,
                      })
                    }
                    placeholder="Nhập địa chỉ"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all outline-none"
                  />
                </div>

                {/* Section: Temple History */}
                <div className="md:col-span-2 mt-4 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900 flex items-center">
                      <Icons.Home className="w-5 h-5 mr-2 text-amber-500" />
                      Lịch sử sinh hoạt
                    </h4>
                    {isEditing && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        Chế độ chỉnh sửa
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Current Activities - Hiển thị các hoạt động đang diễn ra */}
                    {formData.templeHistory && formData.templeHistory.length > 0 ? (
                      <>
                        {[...formData.templeHistory]
                          .filter((h: any) => !h.endDate || h.endDate === '')
                          .sort((a: any, b: any) => {
                            const dateA = parseInt(a.startDate) || 0;
                            const dateB = parseInt(b.startDate) || 0;
                            return dateB - dateA;
                          })
                          .map((history: any, idx: number) => {
                            const templeName = typeof history.templeId === 'object' && history.templeId?.name
                              ? history.templeId.name
                              : temples.find((t) => t._id === history.templeId)?.name || "Unknown Temple";
                            
                            return (
                              <div
                                key={`current-${idx}`}
                                className="bg-green-50 border-green-200 rounded-lg p-4 border flex items-center justify-between"
                              >
                                <div>
                                  <p className="font-bold text-green-900">{templeName}</p>
                                  <p className="text-sm text-green-600">
                                    {history.role ? `${history.role} • ` : ""}
                                    {history.startDate} - Hiện tại
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                                    Đang hoạt động
                                  </span>
                                  {isEditing && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const originalIndex = formData.templeHistory.findIndex((h: any) => 
                                          h.templeId === history.templeId && 
                                          h.startDate === history.startDate
                                        );
                                        if (originalIndex !== -1) {
                                          handleRemoveHistory(originalIndex);
                                        }
                                      }}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                      title="Xóa lịch sử này"
                                    >
                                      <Icons.Trash className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        
                        {/* Past Activities - Lịch sử đã kết thúc */}
                        {[...formData.templeHistory]
                          .filter((h: any) => h.endDate && h.endDate !== '')
                          .sort((a: any, b: any) => {
                            const dateA = parseInt(a.startDate) || 0;
                            const dateB = parseInt(b.startDate) || 0;
                            return dateB - dateA;
                          })
                          .map((history: any, idx: number) => {
                            const templeName = typeof history.templeId === 'object' && history.templeId?.name
                              ? history.templeId.name
                              : temples.find((t) => t._id === history.templeId)?.name || "Unknown Temple";
                            
                            return (
                              <div
                                key={`past-${idx}`}
                                className="bg-gray-50 border-gray-200 rounded-lg p-4 border flex items-center justify-between"
                              >
                                <div>
                                  <p className="font-bold text-gray-800">{templeName}</p>
                                  <p className="text-sm text-gray-500">
                                    {history.role ? `${history.role} • ` : ""}
                                    {history.startDate} - {history.endDate}
                                  </p>
                                </div>
                                {isEditing && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const originalIndex = formData.templeHistory.findIndex((h: any) => 
                                        h.templeId === history.templeId && 
                                        h.startDate === history.startDate
                                      );
                                      if (originalIndex !== -1) {
                                        handleRemoveHistory(originalIndex);
                                      }
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Xóa lịch sử này"
                                  >
                                    <Icons.Trash className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                      </>
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-400 text-sm">Chưa có lịch sử sinh hoạt nào khác.</p>
                      </div>
                    )}

                    {/* Add New History Form (Visible only in Edit Mode) */}
                    {isEditing && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4 animate-in fade-in">
                        <h5 className="text-xs font-bold text-blue-800 uppercase mb-3">Thêm mới</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <select
                            className="w-full text-sm border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            value={newHistory.templeId || ""}
                            onChange={(e) => setNewHistory({ ...newHistory, templeId: e.target.value })}
                            disabled={templesLoading}
                          >
                            <option value="">
                              {templesLoading ? "Đang tải..." : `-- Chọn Thánh Thất (${temples.length}) --`}
                            </option>
                            {temples.map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Chức vụ (Nếu có)"
                            className="w-full text-sm border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-blue-500"
                            value={newHistory.role || ""}
                            onChange={(e) => setNewHistory({ ...newHistory, role: e.target.value })}
                          />
                          <input
                            type="number"
                            placeholder="Năm bắt đầu (VD: 2020)"
                            className="w-full text-sm border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-blue-500"
                            value={newHistory.startDate || ""}
                            onChange={(e) => setNewHistory({ ...newHistory, startDate: e.target.value })}
                          />
                          <input
                            type="number"
                            placeholder="Năm kết thúc (bỏ trống nếu còn)"
                            className="w-full text-sm border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-blue-500"
                            value={newHistory.endDate || ""}
                            onChange={(e) => setNewHistory({ ...newHistory, endDate: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={handleAddHistory}
                            disabled={!newHistory.templeId || !newHistory.startDate}
                            className="md:col-span-2 bg-blue-600 text-white text-sm font-bold py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            Thêm vào lịch sử
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                    <button
                      type="submit"
                      disabled={saveStatus === "saving"}
                      className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                    >
                      {saveStatus === "saving" ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <Icons.CheckCircle className="w-4 h-4 mr-2" /> Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
