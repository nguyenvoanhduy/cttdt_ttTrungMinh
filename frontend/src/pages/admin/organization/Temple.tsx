/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import * as Icons from "@/components/Icons";
import type { Temple } from "@/types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { uploadImage } from '@/services/uploadService';

export const TemplePage = () => {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Temple>>({});
  const [editingId, setEditingId] = useState<string | null>(null); // Track edit mode
  const [isSaving, setIsSaving] = useState(false);
  const [, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ 
    open: false, id: '', name: '' 
  });
  const { toasts, removeToast, success, error: showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    const fetchTemples = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${API_BASE_URL}/temples`, { 
          headers: token ? { Authorization: `Bearer ${token}` } : undefined 
        });
        if (!response.ok) throw new Error("Failed to fetch temples");
        const data = await response.json();
        setTemples(data); // API trả về mảng trực tiếp
        console.log("Đã tải", data.length, "thánh thất từ database");
      } catch (err) {
        console.error("Error fetching temples:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemples();
  }, []);

  // Filter Logic
  const filteredTemples = temples.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNew = () => {
    setFormData({});
    setEditingId(null); // Reset edit mode
    setIsModalOpen(true);
  };

  const handleEdit = (temple: Temple) => {
    setFormData({ 
      ...temple,
      establishedDate: temple.establishedDate 
        ? new Date(temple.establishedDate) as any
        : undefined
    });
    setEditingId(temple._id);
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      const cloudinaryUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: cloudinaryUrl }));
      success('Tải ảnh lên thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      showError('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTriggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem("accessToken");
      const headers: any = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Prepare data
      const saveData = {
        name: formData.name,
        address: formData.address,
        establishedDate: formData.establishedDate
          ? (typeof formData.establishedDate === 'object'
            ? (formData.establishedDate as Date).toISOString()
            : new Date(formData.establishedDate).toISOString())
          : new Date().toISOString(),
        description: formData.description,
        imageUrl: formData.imageUrl,
      };

      if (editingId) {
        // Update existing
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${API_BASE_URL}/temples/${editingId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(saveData),
        });

        if (!response.ok) throw new Error("Failed to update temple");
        const updatedTemple = await response.json();

        setTemples((prev) =>
          prev.map((t) => (t._id === editingId ? updatedTemple : t))
        );
      } else {
        // Create new
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${API_BASE_URL}/temples`, {
          method: "POST",
          headers,
          body: JSON.stringify(saveData),
        });

        if (!response.ok) throw new Error("Failed to create temple");
        const newTemple = await response.json();

        setTemples((prev) => [...prev, newTemple]);
      }

      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);
      success('Đã lưu thánh thất thành công');
    } catch (err) {
      console.error("Error saving temple:", err);
      showError('Có lỗi xảy ra khi lưu thánh thất. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers: any = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/temples/${id}`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Hiển thị message từ backend
        showError(data.message || 'Có lỗi xảy ra khi xóa thánh thất');
        return;
      }

      setTemples((prev) => prev.filter((t) => t._id !== id));
      success('Đã xóa thánh thất thành công');
    } catch (err) {
      console.error("Error deleting temple:", err);
      showError('Có lỗi xảy ra khi xóa thánh thất. Vui lòng thử lại!');
    }
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: '', name: '' });
    await handleDelete(id);
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Thánh Thất & Cơ Sở
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý các cơ sở thờ tự trực thuộc
          </p>
        </div>
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm theo tên, địa chỉ..."
              className="block w-full md:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 shadow-sm transition-colors whitespace-nowrap"
          >
            <Icons.Plus className="w-4 h-4 mr-2" />
            Thêm Thánh Thất
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemples.length > 0 ? (
          filteredTemples.map((temple) => (
            <div
              key={temple._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative"
            >
              <div className="h-40 bg-gray-100 relative overflow-hidden">
                {temple.imageUrl ? (
                  <img
                    src={temple.imageUrl}
                    alt={temple.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                    <Icons.Home className="w-12 h-12 text-white opacity-80" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {temple.name}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start text-sm text-gray-600">
                    <Icons.MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                    {temple.address}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Icons.Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Thành lập: {new Date(temple.establishedDate).getFullYear()}
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-500 line-clamp-2">
                  {temple.description}
                </p>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(temple)}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Icons.Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(temple._id, temple.name)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    title="Xóa"
                  >
                    <Icons.Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            Không tìm thấy kết quả phù hợp
          </div>
        )}
      </div>

      {/* --- CREATE/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? "Chỉnh sửa Thánh Thất" : "Thêm Thánh Thất Mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <Icons.X className="w-5 h-5 text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form
                id="create-temple-form"
                onSubmit={handleSave}
                className="space-y-4"
              >
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh Thánh thất
                  </label>
                  <div
                    onClick={() => !isUploading && handleTriggerFileUpload()}
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center transition-colors relative overflow-hidden h-40 bg-gray-50 ${
                      isUploading ? 'cursor-wait opacity-50' : 'cursor-pointer hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-sm text-gray-500">Đang tải ảnh lên...</span>
                      </>
                    ) : formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        className="w-full h-full object-cover absolute inset-0 rounded-lg"
                        alt="Preview"
                      />
                    ) : (
                      <>
                        <Icons.Image className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          Nhấn để tải ảnh lên
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Thánh Thất
                  </label>
                  <input
                    required
                    name="name"
                    type="text"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    required
                    name="address"
                    type="text"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày thành lập
                  </label>
                  <DatePicker
                    selected={formData.establishedDate
                      ? (typeof formData.establishedDate === 'object'
                        ? formData.establishedDate as Date
                        : new Date(formData.establishedDate))
                      : null}
                    onChange={(date: Date | null) =>
                      setFormData((prev) => ({
                        ...prev,
                        establishedDate: date as any
                      }))
                    }
                    dateFormat="dd/MM/yyyy"
                    placeholderText="dd/MM/yyyy"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    maxDate={new Date()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="create-temple-form"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center"
              >
                {isSaving
                  ? "Đang lưu..."
                  : editingId
                  ? "Lưu thay đổi"
                  : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex items-center mb-4">
                      <Icons.AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                      <h3 className="text-lg font-semibold">Xác nhận xóa</h3>
                  </div>
                  <p className="text-gray-700 mb-2">
                      Bạn có chắc muốn xóa thánh thất "{deleteConfirm.name}"?
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                      Hành động này không thể hoàn tác.
                  </p>
                  <div className="flex justify-end gap-3">
                      <button
                          onClick={() => setDeleteConfirm({ open: false, id: '', name: '' })}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                      >
                          Hủy
                      </button>
                      <button
                          onClick={confirmDelete}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
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
