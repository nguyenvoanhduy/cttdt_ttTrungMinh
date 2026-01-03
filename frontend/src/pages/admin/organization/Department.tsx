import React, { useState, useEffect } from "react";
import * as Icons from "@/components/Icons";
import type { Department, Personal } from "@/types";
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const DepartmentPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [personals, setPersonals] = useState<Personal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Department>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ 
    open: false, id: '', name: '' 
  });
  const { toasts, removeToast, success, error: showError } = useToast();

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  };

  // Fetch departments
  useEffect(() => {
    fetchDepartments();
    fetchPersonals();
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/departments`);
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách ban');
      }

      const result = await response.json();
      setDepartments(result.data || result || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Lỗi tải dữ liệu ban');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPersonals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/personals`);
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách nhân sự');
      }

      const result = await response.json();
      setPersonals(result.data || result || []);
    } catch (err) {
      console.error('Error fetching personals:', err);
    }
  };

  // Filter Logic
  const filteredDepartments = departments.filter((d) => {
    // managerId có thể là object (đã populate) hoặc string
    const manager = typeof d.managerId === 'object' && d.managerId 
      ? d.managerId 
      : personals.find((p) => p._id === d.managerId);
    const managerName = manager && typeof manager === 'object' ? manager.fullname.toLowerCase() : "";
    const term = searchTerm.toLowerCase();

    return d.name.toLowerCase().includes(term) || managerName.includes(term);
  });

  const handleAddNew = () => {
    setFormData({});
    setEditingId(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setFormData({ ...dept });
    setEditingId(dept._id);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setModalError('Vui lòng nhập tên ban');
      return;
    }

    try {
      setIsSaving(true);
      setModalError(null);
      const token = getAuthToken();

      const url = editingId 
        ? `${API_BASE_URL}/departments/${editingId}`
        : `${API_BASE_URL}/departments`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi ${response.status}`);
      }

      await fetchDepartments();
      setIsSaving(false);
      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);
    } catch (err) {
      console.error('Error saving department:', err);
      const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định';
      setModalError(errorMsg || 'Không thể lưu ban');
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const handleDelete = async (id: string) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // Hiển thị message từ backend
        showError(data.message || 'Không thể xóa ban');
        setError(data.message || 'Lỗi xóa ban');
        return;
      }

      await fetchDepartments();
      success('Đã xóa ban thành công');
    } catch (err) {
      console.error('Error deleting department:', err);
      setError('Lỗi xóa ban');
      showError('Không thể xóa ban');
    }
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: '', name: '' });
    await handleDelete(id);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-in fade-in duration-500">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ban</h1>
          <p className="text-gray-500 text-sm mt-1">
            Danh sách các ban bộ và nhân sự phụ trách
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
              placeholder="Tìm tên Ban, Trưởng Ban..."
              className="block w-full md:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors whitespace-nowrap"
          >
            <Icons.Plus className="w-4 h-4 mr-2" />
            Tạo Ban Mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tên Ban
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trưởng Ban (Manager)
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept) => {
                  // managerId có thể là object (đã populate) hoặc string
                  const manager = typeof dept.managerId === 'object' && dept.managerId
                    ? dept.managerId
                    : personals.find((p) => p._id === dept.managerId);
                  return (
                    <tr key={dept._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                            <Icons.Briefcase className="w-5 h-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {dept.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {dept._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-md">
                          {dept.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {manager && typeof manager === 'object' ? (
                          <div className="flex items-center">
                            <img
                              className="h-8 w-8 rounded-full object-cover mr-2"
                              src={
                                manager.avatarUrl ||
                                `https://ui-avatars.com/api/?name=${manager.fullname}`
                              }
                              alt=""
                            />
                            <span className="text-sm text-gray-700">
                              {manager.fullname}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Chưa bổ nhiệm
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(dept)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteClick(dept._id!, dept.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
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

      {/* --- CREATE/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => !isSaving && setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? "Chỉnh sửa Ban" : "Tạo Ban Chuyên Môn"}
              </h3>
              <button onClick={() => !isSaving && setIsModalOpen(false)}>
                <Icons.X className="w-5 h-5 text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <div className="p-6">
              {modalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {modalError}
                </div>
              )}

              <form
                id="create-dept-form"
                onSubmit={handleSave}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Ban
                  </label>
                  <input
                    required
                    name="name"
                    type="text"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nhập tên ban..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả nhiệm vụ
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nhập mô tả..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trưởng Ban (Tùy chọn)
                  </label>
                  <select
                    name="managerId"
                    value={formData.managerId || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option key="empty" value="">-- Chọn Trưởng Ban --</option>
                    {personals.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.fullname}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="create-dept-form"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
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
                      Bạn có chắc muốn xóa ban "{deleteConfirm.name}"?
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
