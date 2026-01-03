/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import * as Icons from "@/components/Icons";
import {
  UserStatus,
  Gender,
  type Personal,
  type TempleHistoryEntry,
} from "@/types";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const PersonalPage = () => {
  const { toasts, removeToast, success, error, warning } = useToast();
  const [personals, setPersonals] = useState<Personal[]>([]);
  const [temples, setTemples] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPerson, setCurrentPerson] = useState<Personal | null>(null);
  const [formData, setFormData] = useState<Partial<Personal>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [newHistory, setNewHistory] = useState<Partial<TempleHistoryEntry>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  };

  // Fetch all data
  useEffect(() => {
    fetchPersonals();
    fetchTemples();
    fetchDepartments();
  }, []);

  const fetchPersonals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/personals`);
      if (!response.ok) throw new Error('Không thể tải danh sách');
      const result = await response.json();
      setPersonals(result.data || result || []);
      setFetchError(null);
    } catch (err) {
      console.error('Error fetching personals:', err);
      setFetchError('Lỗi tải dữ liệu nhân sự');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemples = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/temples`);
      if (!response.ok) throw new Error('Không thể tải danh sách');
      const result = await response.json();
      setTemples(result.data || result || []);
    } catch (err) {
      console.error('Error fetching temples:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments`);
      if (!response.ok) throw new Error('Không thể tải danh sách');
      const result = await response.json();
      setDepartments(result.data || result || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  // Filter logic
  const filteredData = personals.filter((p) =>
    p.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- HANDLERS ---

  const handleAddNew = () => {
    setCurrentPerson(null);
    setFormData({
      status: UserStatus.ACTIVE,
      gender: Gender.MALE,
      templeHistory: [],
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (person: Personal) => {
    setCurrentPerson(person);
    // Clone data và bao gồm cả userPhone nếu có
    setFormData({ 
      ...person,
      phonenumber: (person as any).userPhone || person.phonenumber || ""
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: '', name: '' });
    
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/personals/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Không thể xóa tín đồ');
      }
      
      setPersonals((prev) => prev.filter((p) => p._id !== id));
      success('Xóa tín đồ thành công!');
    } catch (err) {
      console.error('Error deleting personal:', err);
      error('Lỗi khi xóa tín đồ. Vui lòng thử lại.');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // History Handlers
  const handleAddHistory = () => {
    if (newHistory.templeId && newHistory.startDate) {
      const entry: TempleHistoryEntry = {
        templeId: newHistory.templeId,
        startDate: newHistory.startDate,
        endDate: newHistory.endDate || undefined,
        role: newHistory.role || "",
      };
      setFormData((prev) => ({
        ...prev,
        templeHistory: [entry, ...(prev.templeHistory || [])],
      }));
      setNewHistory({});
    }
  };

  const handleRemoveHistory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      templeHistory: prev.templeHistory?.filter((_, i) => i !== index),
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      error('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF, WEBP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error('Kích thước ảnh không được vượt quá 10MB');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setModalError(null);

    try {
      const token = getAuthToken();
      let avatarUrl = formData.avatarUrl;

      // Upload avatar if new file selected
      if (avatarFile && currentPerson) {
        setUploadingAvatar(true);
        const formDataUpload = new FormData();
        formDataUpload.append('avatar', avatarFile);

        const uploadResponse = await fetch(`${API_BASE_URL}/personals/avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataUpload,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          avatarUrl = uploadResult.avatarUrl || uploadResult.data?.avatarUrl;
        }
        setUploadingAvatar(false);
      }

      const payload = {
        ...formData,
        avatarUrl,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
      };

      if (currentPerson) {
        // Edit mode - PUT
        const response = await fetch(`${API_BASE_URL}/personals/${currentPerson._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Không thể cập nhật thông tin');
        }

        const updatedPerson = await response.json();
        setPersonals((prev) =>
          prev.map((p) =>
            p._id === currentPerson._id
              ? (updatedPerson.data || updatedPerson)
              : p
          )
        );
        success('Cập nhật thông tin thành công!');
      } else {
        // Add mode - POST
        const response = await fetch(`${API_BASE_URL}/personals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Không thể thêm tín đồ mới');
        }

        const newPerson = await response.json();
        setPersonals((prev) => [newPerson.data || newPerson, ...prev]);
        success('Thêm tín đồ mới thành công!');
      }

      setIsModalOpen(false);
      setCurrentPerson(null);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      console.error('Error saving personal:', err);
      setModalError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Tín đồ</h1>
          <p className="text-gray-500 text-sm mt-1">
            Danh sách nhân sự và chức sắc
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddNew}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Icons.Plus className="w-4 h-4 mr-2" />
              Thêm tín đồ
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Thông tin cá nhân
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Ngày sinh / Giới tính
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Chức vụ & Nơi sinh hoạt
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Trạng thái
                </th>
                <th
                  scope="col"
                  className="relative px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((person) => {
                // Find the current temple from temple history (most recent entry without endDate)
                const currentHistory = person.templeHistory?.find(h => !h.endDate);
                const temple = temples.find(
                  (t) => t._id === currentHistory?.templeId
                );

                return (
                  <tr
                    key={person._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {person.avatarUrl ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover border border-gray-200"
                              src={person.avatarUrl}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                              <Icons.User className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            {person.fullname}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Icons.Phone className="w-3 h-3 mr-1" />
                            {(person as any).userPhone || person.phonenumber || "---"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {person.dateOfBirth
                          ? new Date(person.dateOfBirth).toLocaleDateString(
                              "vi-VN"
                            )
                          : "-"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {person.gender}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        {person.position ? (
                          <span className="text-sm font-medium text-blue-600 mb-1">
                            {person.position}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Tín đồ
                          </span>
                        )}
                        <span className="text-xs text-gray-500 flex items-center">
                          <Icons.Home className="w-3 h-3 mr-1" />
                          {temple ? temple.name : "Chưa phân bổ"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          person.status === UserStatus.ACTIVE
                            ? "bg-green-50 text-green-700 border-green-200"
                            : person.status === UserStatus.ON_LEAVE
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            person.status === UserStatus.ACTIVE
                              ? "bg-green-600"
                              : person.status === UserStatus.ON_LEAVE
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                        ></span>
                        {person.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(person)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Icons.Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(person._id, person.fullname)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Icons.Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            Hiển thị {filteredData.length} kết quả
          </p>
        </div>
      </div>

      {/* --- EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Icons.UserCog className="w-5 h-5 mr-2 text-blue-600" />
                {currentPerson ? "Chỉnh sửa thông tin" : "Thêm mới tín đồ"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Form) */}
            <div className="p-6 overflow-y-auto">
              {modalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <div className="flex items-start">
                    <Icons.AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{modalError}</span>
                  </div>
                </div>
              )}
              <form
                id="edit-form"
                onSubmit={handleSave}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Avatar Preview */}
                <div className="md:col-span-2 flex flex-col items-center mb-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <div 
                    className="relative group cursor-pointer"
                    onClick={handleAvatarClick}
                  >
                    <img
                      src={
                        avatarPreview ||
                        formData.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${
                          formData.fullname || "U"
                        }`
                      }
                      className="w-24 h-24 rounded-full border-4 border-blue-50 object-cover"
                      alt="Avatar"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icons.Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  {uploadingAvatar && (
                    <p className="text-xs text-blue-600 mt-2">Đang tải ảnh lên...</p>
                  )}
                  {avatarFile && (
                    <p className="text-xs text-green-600 mt-2">Ảnh mới đã chọn: {avatarFile.name}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Click để thay đổi ảnh đại diện</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên Thánh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    required
                    value={formData.fullname || ""}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phonenumber"
                    disabled
                    value={formData.phonenumber || ""}
                    onChange={handleInputChange}
                    placeholder="Số điện thoại được gán khi tạo tài khoản"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                    title="Số điện thoại chỉ được gán khi tạo tài khoản User"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Số điện thoại được gán tự động khi tạo tài khoản đăng nhập
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    placeholder="ten@gmail.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <DatePicker
                    selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                    onChange={(date: Date | null) =>
                      setFormData((prev) => ({ ...prev, dateOfBirth: date ? date.toISOString() : undefined }))
                    }
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/MM/yyyy"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    maxDate={new Date()}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={formData.gender || Gender.OTHER}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
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
                    name="address"
                    rows={3}
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all"
                  ></textarea>
                </div>

                <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                  <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center">
                    <Icons.Briefcase className="w-4 h-4 mr-2 text-blue-600" />
                    Thông tin Tổ chức
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chức vụ
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position || ""}
                    onChange={handleInputChange}
                    placeholder="VD: Lễ Sanh, Hộ Pháp..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={formData.status || UserStatus.ACTIVE}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
                  >
                    <option value={UserStatus.ACTIVE}>Đang hoạt động</option>
                    <option value={UserStatus.ON_LEAVE}>Tạm nghỉ</option>
                    <option value={UserStatus.INACTIVE}>Ngừng hoạt động</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thuộc Ban
                  </label>
                  <select
                    name="department"
                    value={formData.department || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
                  >
                    <option value="">-- Không thuộc ban nào --</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TEMPLE HISTORY SECTION */}
                <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-4">
                  <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center">
                    <Icons.Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    Lịch sử sinh hoạt
                  </h4>

                  {/* List of existing history */}
                  <div className="space-y-3 mb-4">
                    {formData.templeHistory?.map((history, idx) => {
                      const temple = temples.find(
                        (t) => t._id === history.templeId
                      );
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div>
                            <div className="font-bold text-gray-800 text-sm">
                              {temple ? temple.name : "Unknown Temple"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {history.role ? `${history.role} • ` : ""}{" "}
                              {history.startDate}{" "}
                              {history.endDate
                                ? ` - ${history.endDate}`
                                : " - Hiện tại"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveHistory(idx)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                          >
                            <Icons.Trash className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                    {(!formData.templeHistory ||
                      formData.templeHistory.length === 0) && (
                      <p className="text-sm text-gray-400 italic">
                        Chưa có lịch sử sinh hoạt.
                      </p>
                    )}
                  </div>

                  {/* Add New History Form */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h5 className="text-xs font-bold text-blue-800 uppercase mb-3">
                      Thêm mới
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        className="w-full text-sm border-gray-300 rounded-md p-2 bg-white"
                        value={newHistory.templeId || ""}
                        onChange={(e) =>
                          setNewHistory({
                            ...newHistory,
                            templeId: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Chọn Thánh Thất --</option>
                        {temples.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Chức vụ (VD: Lễ Sanh)"
                        className="w-full text-sm border-gray-300 rounded-md p-2"
                        value={newHistory.role || ""}
                        onChange={(e) =>
                          setNewHistory({ ...newHistory, role: e.target.value })
                        }
                      />
                      <input
                        type="number"
                        placeholder="Năm bắt đầu (VD: 2020)"
                        className="w-full text-sm border-gray-300 rounded-md p-2"
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
                        className="w-full text-sm border-gray-300 rounded-md p-2"
                        value={newHistory.endDate || ""}
                        onChange={(e) =>
                          setNewHistory({
                            ...newHistory,
                            endDate: e.target.value,
                          })
                        }
                        placeholder="Năm kết thúc (bỏ trống nếu còn)"
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
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                disabled={isSaving}
              >
                Hủy
              </button>
              <button
                type="submit"
                form="edit-form"
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all disabled:opacity-70 flex items-center"
                disabled={isSaving}
              >
                {isSaving ? (
                  "Đang lưu..."
                ) : (
                  <>
                    <Icons.CheckCircle className="w-4 h-4 mr-2" /> Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteConfirm({ open: false, id: '', name: '' })}
          ></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-in zoom-in-95 duration-200">
            {/* Icon and Title */}
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa tín đồ</h3>
              <p className="text-gray-600 mb-1">
                Bạn có chắc chắn muốn xóa tín đồ
              </p>
              <p className="text-lg font-bold text-red-600 mb-4">{deleteConfirm.name}?</p>
              <p className="text-sm text-gray-500">
                Hành động này không thể hoàn tác.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => setDeleteConfirm({ open: false, id: '', name: '' })}
                className="flex-1 px-4 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors border border-gray-300"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md transition-all flex items-center justify-center"
              >
                <Icons.Trash className="w-4 h-4 mr-2" />
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
