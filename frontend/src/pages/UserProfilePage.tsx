import React, { useState, useEffect, useRef } from "react";
import * as Icons from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Gender, type TempleHistoryEntry } from "../types";
import { MOCK_TEMPLES } from "../constants";

export const UserProfilePage = () => {
  const { user, personal, isAuthenticated, updatePersonal } = useAuth();
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">(
    "idle"
  );
  const [newHistory, setNewHistory] = useState<Partial<TempleHistoryEntry>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (personal) {
      setFormData({
        fullname: personal.fullname,
        gender: personal.gender,
        dateOfBirth: personal.dateOfBirth
          ? new Date(personal.dateOfBirth).toISOString().split("T")[0]
          : "",
        address: personal.address,
        email: "user@example.com", // Mock email
        phoneNumber: user?.phoneNumber,
        templeHistory: personal.templeHistory || [],
      });
    }
  }, [personal, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");

    // Simulate API call
    setTimeout(() => {
      updatePersonal({
        fullname: formData.fullname,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        templeHistory: formData.templeHistory,
      });
      setSaveStatus("success");
      setIsEditing(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }, 1000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload by reading data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonal({ avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

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

  // Helper to get current temple name
  const currentTemple = personal?.currentTempleId
    ? MOCK_TEMPLES.find((t) => t._id === personal.currentTempleId)?.name
    : "Chưa cập nhật";

  return (
    <div className="animate-in fade-in duration-500 bg-gray-50 min-h-screen pb-12">
      {/* Header Background */}
      <div className="h-48 bg-gradient-to-r from-blue-900 to-blue-700 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      <div className="container mx-auto px-6 -mt-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Avatar & Quick Info */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 text-center border-b border-gray-100">
                <div className="relative inline-block mb-4 group">
                  <img
                    src={
                      personal?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${personal?.fullname}&background=0D8ABC&color=fff`
                    }
                    alt="Avatar"
                    className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
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
                    className="absolute bottom-1 right-1 p-2 bg-gray-800 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm"
                    title="Thay đổi ảnh đại diện"
                  >
                    <Icons.Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {personal?.fullname}
                </h2>
                <p className="text-blue-600 font-medium">
                  {personal?.position || "Tín đồ"}
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      personal?.status === "Đang hoạt động"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {personal?.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Icons.Info className="w-4 h-4 mr-2 text-blue-500" />
                  Thông tin liên hệ
                </h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-center">
                    <Icons.Phone className="w-4 h-4 mr-3 text-gray-400" />
                    {user?.phoneNumber}
                  </li>
                  <li className="flex items-center">
                    <Icons.Mail className="w-4 h-4 mr-3 text-gray-400" />
                    user@example.com
                  </li>
                  <li className="flex items-start">
                    <Icons.MapPin className="w-4 h-4 mr-3 mt-0.5 text-gray-400" />
                    {personal?.address || "Chưa cập nhật địa chỉ"}
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

          {/* Right Column: Detailed Form */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Icons.UserCog className="w-6 h-6 mr-2 text-blue-600" />
                  Thông tin cá nhân
                </h3>
              </div>

              {saveStatus === "success" && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
                  <Icons.CheckCircle className="w-5 h-5 mr-2" />
                  Cập nhật thông tin thành công!
                </div>
              )}

              <form
                onSubmit={handleSave}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên Thánh
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.fullname || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, fullname: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    disabled={true} // Read-only ID
                    value={formData.phoneNumber || ""}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    value={formData.dateOfBirth || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    disabled={!isEditing}
                    value={formData.gender || Gender.OTHER}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
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
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all outline-none"
                  ></textarea>
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
                    {/* Current Temple First */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-blue-900">
                          {currentTemple}
                        </p>
                        <p className="text-sm text-blue-600">
                          Thánh thất hiện tại
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-white text-blue-600 text-xs font-bold rounded-full shadow-sm">
                        Hiện tại
                      </span>
                    </div>

                    {/* History List */}
                    {formData.templeHistory &&
                    formData.templeHistory.length > 0 ? (
                      formData.templeHistory.map(
                        (history: TempleHistoryEntry, idx: number) => {
                          const temple = MOCK_TEMPLES.find(
                            (t) => t._id === history.templeId
                          );
                          return (
                            <div
                              key={idx}
                              className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between"
                            >
                              <div>
                                <p className="font-bold text-gray-800">
                                  {temple ? temple.name : "Unknown Temple"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {history.role ? `${history.role} • ` : ""}
                                  {history.startDate} -{" "}
                                  {history.endDate
                                    ? history.endDate
                                    : "Hiện tại"}
                                </p>
                              </div>
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHistory(idx)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                  title="Xóa lịch sử này"
                                >
                                  <Icons.Trash className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        }
                      )
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-400 text-sm">
                          Chưa có lịch sử sinh hoạt nào khác.
                        </p>
                      </div>
                    )}

                    {/* Add New History Form (Visible only in Edit Mode) */}
                    {isEditing && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4 animate-in fade-in">
                        <h5 className="text-xs font-bold text-blue-800 uppercase mb-3">
                          Thêm mới
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <select
                            className="w-full text-sm border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            value={newHistory.templeId || ""}
                            onChange={(e) =>
                              setNewHistory({
                                ...newHistory,
                                templeId: e.target.value,
                              })
                            }
                          >
                            <option value="">-- Chọn Thánh Thất --</option>
                            {MOCK_TEMPLES.map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Chức vụ (VD: Lễ Sanh)"
                            className="w-full text-sm border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-blue-500"
                            value={newHistory.role || ""}
                            onChange={(e) =>
                              setNewHistory({
                                ...newHistory,
                                role: e.target.value,
                              })
                            }
                          />
                          <input
                            type="number"
                            placeholder="Năm bắt đầu (VD: 2020)"
                            className="w-full text-sm border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-blue-500"
                            value={newHistory.startDate || ""}
                            onChange={(e) =>
                              setNewHistory({
                                ...newHistory,
                                startDate: e.target.value,
                              })
                            }
                          />
                          <input
                            type="number"
                            placeholder="Năm kết thúc (bỏ trống nếu còn)"
                            className="w-full text-sm border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-blue-500"
                            value={newHistory.endDate || ""}
                            onChange={(e) =>
                              setNewHistory({
                                ...newHistory,
                                endDate: e.target.value,
                              })
                            }
                          />
                          <button
                            type="button"
                            onClick={handleAddHistory}
                            disabled={
                              !newHistory.templeId || !newHistory.startDate
                            }
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
                          <Icons.CheckCircle className="w-4 h-4 mr-2" /> Lưu
                          thay đổi
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
    </div>
  );
};
