import React, { useState } from "react";
import * as Icons from "@/components/Icons";
import { MOCK_DEPARTMENTS, MOCK_PERSONALS } from "@/constants";
import type { Department } from "@/types";

export const DepartmentPage = () => {
  const [departments, setDepartments] =
    useState<Department[]>(MOCK_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState(""); // Search State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Department>>({});
  const [editingId, setEditingId] = useState<string | null>(null); // Track edit mode
  const [isSaving, setIsSaving] = useState(false);

  // Filter Logic
  const filteredDepartments = departments.filter((d) => {
    const manager = MOCK_PERSONALS.find((p) => p._id === d.managerId);
    const managerName = manager ? manager.fullname.toLowerCase() : "";
    const term = searchTerm.toLowerCase();

    return d.name.toLowerCase().includes(term) || managerName.includes(term);
  });

  const handleAddNew = () => {
    setFormData({});
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setFormData({ ...dept });
    setEditingId(dept._id);
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      if (editingId) {
        // Update existing
        setDepartments((prev) =>
          prev.map((d) =>
            d._id === editingId ? ({ ...d, ...formData } as Department) : d
          )
        );
      } else {
        // Create new
        const newDept: Department = {
          _id: Date.now().toString(),
          name: formData.name || "Ban Mới",
          description: formData.description,
          managerId: formData.managerId,
        };
        setDepartments((prev) => [...prev, newDept]);
      }

      setIsSaving(false);
      setIsModalOpen(false);
      setFormData({});
      setEditingId(null);
    }, 800);
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa Ban này không? Hành động này không thể hoàn tác."
      )
    ) {
      setDepartments((prev) => prev.filter((d) => d._id !== id));
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ban Chuyên Môn</h1>
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
                  const manager = MOCK_PERSONALS.find(
                    (p) => p._id === dept.managerId
                  );
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
                          {dept.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {manager ? (
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
                          onClick={() => handleDelete(dept._id)}
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
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? "Chỉnh sửa Ban" : "Tạo Ban Chuyên Môn"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <Icons.X className="w-5 h-5 text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <div className="p-6">
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
                    <option value="">-- Chọn Trưởng Ban --</option>
                    {MOCK_PERSONALS.map((p) => (
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
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="create-dept-form"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
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
    </div>
  );
};
