/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import * as Icons from "@/components/Icons";
import { type User, UserRole, type Personal } from "@/types";
import { userService } from "@/services/userService";
import { personalService } from "@/services/personalService";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";

export const Roles = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [personals, setPersonals] = useState<Personal[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // Search State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ 
    open: false, id: '', name: '' 
  });
  const { toasts, removeToast, success, error: showError } = useToast();

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [usersRes, personalsRes] = await Promise.all([
        userService.getAll(),
        personalService.getAll()
      ]);
      // userService returns { users: [] }, personalService returns [] directly
      const usersData: any = usersRes.data;
      setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
      setPersonals(personalsRes.data || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter Logic
  const filteredUsers = users.filter((user) => {
    const personal = typeof user.personalId === 'object' 
      ? user.personalId 
      : personals.find((p) => p._id === user.personalId);
    const name = personal ? personal.fullname.toLowerCase() : "";
    const phone = user.phonenumber ? user.phonenumber.toLowerCase() : "";
    const term = searchTerm.toLowerCase();
    return name.includes(term) || phone.includes(term);
  });

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingUserId(null);
    setFormData({ role: UserRole.MEMBER });
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setIsEditMode(true);
    setEditingUserId(user._id);
    setFormData({
      _id: user._id,
      role: user.role,
      phonenumber: user.phonenumber,
      personalId: user.personalId,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      if (isEditMode && editingUserId) {
        // Update user role
        await userService.updateRole(editingUserId, formData.role || UserRole.MEMBER);
        success("Cập nhật vai trò thành công!");
      } else {
        // Create new user
        await userService.create({
          phonenumber: formData.phonenumber || "",
          role: formData.role || UserRole.MEMBER,
          personalId: formData.personalId || "",
        });
        success("Tạo tài khoản thành công!");
      }
      
      // Refresh user list
      await fetchData();
      
      setIsModalOpen(false);
      setFormData({});
      setIsEditMode(false);
      setEditingUserId(null);
    } catch (err: any) {
      console.error('Error saving user:', err);
      const errorMsg = err.response?.data?.message || 'Không thể lưu thông tin';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const handleDelete = async (id: string) => {
    try {
      await userService.delete(id);
      await fetchData();
      success("Xóa tài khoản thành công!");
    } catch (err: any) {
      console.error('Error deleting user:', err);
      showError(err.response?.data?.message || 'Không thể xóa tài khoản');
    }
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: '', name: '' });
    await handleDelete(id);
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Tài khoản & Phân quyền
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý quyền truy cập hệ thống
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
              placeholder="Tìm theo tên, SĐT..."
              className="block w-full md:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-sm transition-colors whitespace-nowrap"
          >
            <Icons.Plus className="w-4 h-4 mr-2" />
            Thêm Tài khoản
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Tên người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Vai trò (Role)
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const personal = typeof user.personalId === 'object'
                    ? user.personalId
                    : personals.find((p) => p._id === user.personalId);
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs mr-3">
                            {personal ? personal.fullname.charAt(0) : "U"}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {personal ? personal.fullname : "Unknown"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.phonenumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "Admin"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "Trưởng Ban"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => {
                            const personal = typeof user.personalId === 'object' 
                              ? user.personalId 
                              : personals.find((p) => p._id === user.personalId);
                            handleDeleteClick(user._id, personal?.fullname || user.phonenumber);
                          }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy kết quả phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ADD USER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {isEditMode ? "Chỉnh sửa vai trò" : "Cấp quyền truy cập"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <Icons.X className="w-5 h-5 text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <div className="p-6">
              <form
                id="create-user-form"
                onSubmit={handleSave}
                className="space-y-4"
              >
                {!isEditMode && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chọn Tín đồ
                      </label>
                      <select
                        name="personalId"
                        required
                        value={formData.personalId || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                      >
                        <option value="">-- Chọn danh tính --</option>
                        {personals.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.fullname}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại (Tên đăng nhập)
                      </label>
                      <input
                        required
                        name="phonenumber"
                        type="text"
                        value={formData.phonenumber || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </>
                )}

                {isEditMode && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Đang chỉnh sửa:</strong> Chỉ có thể thay đổi vai trò của người dùng
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò hệ thống
                  </label>
                  <select
                    name="role"
                    value={formData.role || UserRole.MEMBER}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                  >
                    <option value={UserRole.MEMBER}>Thành viên</option>
                    <option value={UserRole.MANAGER}>Trưởng Ban</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </div>

                {!isEditMode && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800">
                    <p>
                      <strong>Lưu ý:</strong> Mật khẩu mặc định sẽ được gửi qua
                      SMS cho người dùng. Người dùng cần đổi mật khẩu sau lần đăng
                      nhập đầu tiên.
                    </p>
                  </div>
                )}
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
                form="create-user-form"
                disabled={isSaving}
                className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-sm transition-colors"
              >
                {isSaving ? "Đang lưu..." : isEditMode ? "Cập nhật" : "Lưu tài khoản"}
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
                      Bạn có chắc muốn xóa tài khoản "{deleteConfirm.name}"?
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
    </div>
  );
};
