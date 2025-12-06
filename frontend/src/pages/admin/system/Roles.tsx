import React, { useState } from "react";
import * as Icons from "@/components/Icons";
import { MOCK_USERS, MOCK_PERSONALS } from "@/constants";
import { type User, UserRole } from "@/types";

export const Roles = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState(""); // Search State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Filter Logic
  const filteredUsers = users.filter((user) => {
    const personal = MOCK_PERSONALS.find((p) => p._id === user.personalId);
    const name = personal ? personal.fullname.toLowerCase() : "";
    const phone = user.phoneNumber.toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || phone.includes(term);
  });

  const handleAddNew = () => {
    setFormData({ role: UserRole.MEMBER });
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      const newUser: User = {
        _id: Date.now().toString(),
        phoneNumber: formData.phoneNumber || "",
        role: formData.role || UserRole.MEMBER,
        personalId: formData.personalId || "",
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      setIsSaving(false);
      setIsModalOpen(false);
      setFormData({});
    }, 800);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) {
      setUsers((prev) => prev.filter((u) => u._id !== id));
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
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
                const personal = MOCK_PERSONALS.find(
                  (p) => p._id === user.personalId
                );
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
                      {user.phoneNumber}
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
                      <button className="text-blue-600 hover:text-blue-900 mr-4">
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
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
                Cấp quyền truy cập
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
                    {MOCK_PERSONALS.map((p) => (
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
                    name="phoneNumber"
                    type="text"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

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

                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800">
                  <p>
                    <strong>Lưu ý:</strong> Mật khẩu mặc định sẽ được gửi qua
                    SMS cho người dùng. Người dùng cần đổi mật khẩu sau lần đăng
                    nhập đầu tiên.
                  </p>
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
                form="create-user-form"
                disabled={isSaving}
                className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-sm transition-colors"
              >
                {isSaving ? "Đang lưu..." : "Lưu tài khoản"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
