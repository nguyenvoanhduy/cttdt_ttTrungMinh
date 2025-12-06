import React, { useState, useEffect } from "react";
import * as Icons from "@/components/Icons";
import { MOCK_PERSONALS, MOCK_TEMPLES, MOCK_DEPARTMENTS } from "@/constants";
import {
  UserStatus,
  Gender,
  type Personal,
  type TempleHistoryEntry,
} from "@/types";

export const PersonalPage = () => {
  // 1. Convert Mock Data to State to allow UI updates
  const [personals, setPersonals] = useState<Personal[]>(MOCK_PERSONALS);
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPerson, setCurrentPerson] = useState<Personal | null>(null);
  const [formData, setFormData] = useState<Partial<Personal>>({});
  const [isSaving, setIsSaving] = useState(false);

  // New History Item State
  const [newHistory, setNewHistory] = useState<Partial<TempleHistoryEntry>>({});

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
    setIsModalOpen(true);
  };

  const handleEditClick = (person: Personal) => {
    setCurrentPerson(person);
    setFormData({ ...person }); // Clone data to form
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tín đồ này không?")) {
      setPersonals((prev) => prev.filter((p) => p._id !== id));
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulate API Call
    setTimeout(() => {
      if (currentPerson) {
        // Edit mode
        setPersonals((prev) =>
          prev.map((p) =>
            p._id === currentPerson._id
              ? ({ ...p, ...formData } as Personal)
              : p
          )
        );
      } else {
        // Add mode
        const newPerson: Personal = {
          ...formData,
          _id: Date.now().toString(),
          status: formData.status || UserStatus.ACTIVE,
          fullname: formData.fullname || "New Member",
          gender: formData.gender || Gender.OTHER,
          templeHistory: formData.templeHistory || [],
        } as Personal;
        setPersonals((prev) => [newPerson, ...prev]);
      }

      setIsSaving(false);
      setIsModalOpen(false);
      setCurrentPerson(null);
    }, 800);
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
                const temple = MOCK_TEMPLES.find(
                  (t) => t._id === person.currentTempleId
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
                            {person.phoneNumber || "---"}
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
                          onClick={() => handleDeleteClick(person._id)}
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
              <form
                id="edit-form"
                onSubmit={handleSave}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Avatar Preview */}
                <div className="md:col-span-2 flex justify-center mb-4">
                  <div className="relative group cursor-pointer">
                    <img
                      src={
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
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên Thánh
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    required
                    value={formData.fullname || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={
                      formData.dateOfBirth
                        ? new Date(formData.dateOfBirth)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value={Gender.MALE}>Nam</option>
                    <option value={Gender.FEMALE}>Nữ</option>
                    <option value={Gender.OTHER}>Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={formData.status || UserStatus.ACTIVE}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value={UserStatus.ACTIVE}>Đang hoạt động</option>
                    <option value={UserStatus.ON_LEAVE}>Tạm nghỉ</option>
                    <option value={UserStatus.INACTIVE}>Ngừng hoạt động</option>
                  </select>
                </div>

                <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                  <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">
                    Thông tin Tổ chức
                  </h4>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chức vụ / Phẩm vị
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position || ""}
                    onChange={handleInputChange}
                    placeholder="VD: Lễ Sanh, Tín đồ..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thánh Thất sinh hoạt
                  </label>
                  <select
                    name="currentTempleId"
                    value={formData.currentTempleId || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="">-- Chọn Thánh Thất --</option>
                    {MOCK_TEMPLES.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thuộc Ban / Bộ phận
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="">-- Không thuộc ban nào --</option>
                    {MOCK_DEPARTMENTS.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    name="note"
                    rows={2}
                    value={formData.note || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  ></textarea>
                </div>

                {/* TEMPLE HISTORY SECTION */}
                <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                  <h4 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center justify-between">
                    Lịch sử sinh hoạt
                  </h4>

                  {/* List of existing history */}
                  <div className="space-y-3 mb-4">
                    {formData.templeHistory?.map((history, idx) => {
                      const temple = MOCK_TEMPLES.find(
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
                        {MOCK_TEMPLES.map((t) => (
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
    </div>
  );
};
