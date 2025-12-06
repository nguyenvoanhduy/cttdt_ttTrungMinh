import React, { useState } from "react";
import * as Icons from "@/components/Icons";
import { MOCK_EVENTS, MOCK_PERSONALS } from "@/constants";
import { EventStatus, type Event, type Personal } from "@/types";

export const Events = () => {
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState(""); // Search State
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<
    "info" | "organizers" | "participants"
  >("info");

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Updated Filter Logic
  const filteredEvents = events.filter((e) => {
    const matchesStatus = filter === "All" || e.status === filter;
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // --- MOCK HELPERS FOR DETAIL VIEW ---
  const getOrganizer = (event: Event) =>
    MOCK_PERSONALS.find((p) => p._id === event.organizerId);
  const getCommitteeMembers = () => MOCK_PERSONALS.slice(0, 3);
  const getParticipants = () => {
    return MOCK_PERSONALS.map((p, index) => ({
      ...p,
      registerDate: new Date().toISOString(), // Mock register date
      checkInStatus: index % 2 === 0 ? "Đã điểm danh" : "Chưa điểm danh",
    }));
  };
  const participants = selectedEvent ? getParticipants() : [];

  // --- HANDLERS ---
  const handleAddNew = () => {
    setFormData({
      status: EventStatus.UPCOMING,
      eventType: "Lễ lớn",
    });
    setIsCreateModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      const newEvent: Event = {
        ...formData,
        _id: Date.now().toString(),
        name: formData.name || "Sự kiện mới",
        startTime: formData.startTime || new Date().toISOString(),
        endTime: formData.endTime || new Date().toISOString(),
        location: formData.location || "Chưa cập nhật",
        eventType: formData.eventType || "Khác",
        status: formData.status || EventStatus.UPCOMING,
        participantsCount: 0,
      } as Event;
      setEvents((prev) => [newEvent, ...prev]);
      setIsSaving(false);
      setIsCreateModalOpen(false);
      setFormData({});
    }, 800);
  };

  const handleExportExcel = () => {
    if (!selectedEvent) return;
    const headers = [
      "STT",
      "Họ và Tên",
      "Giới tính",
      "Số điện thoại",
      "Chức vụ",
      "Ngày đăng ký",
      "Trạng thái",
    ];
    const rows = participants.map((p, idx) => [
      idx + 1,
      p.fullname,
      p.gender,
      p.phoneNumber || "N/A",
      p.position || "Tín đồ",
      new Date(p.registerDate).toLocaleDateString(),
      p.checkInStatus,
    ]);
    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Danh_sach_dang_ky_${selectedEvent.name}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Sự kiện</h1>
          <p className="text-gray-500 text-sm mt-1">
            Lên kế hoạch các lễ hội và hoạt động đạo sự
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm sự kiện..."
              className="block w-full md:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-primary-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">Tất cả trạng thái</option>
              <option value={EventStatus.UPCOMING}>
                {EventStatus.UPCOMING}
              </option>
              <option value={EventStatus.ONGOING}>{EventStatus.ONGOING}</option>
              <option value={EventStatus.COMPLETED}>
                {EventStatus.COMPLETED}
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <Icons.ChevronDown className="h-4 w-4" />
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <Icons.Plus className="w-4 h-4 mr-2" />
            Tạo sự kiện
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const organizer = MOCK_PERSONALS.find(
            (p) => p._id === event.organizerId
          );
          const isUpcoming = event.status === EventStatus.UPCOMING;

          return (
            <div
              key={event._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="h-40 bg-gray-200 relative overflow-hidden">
                <img
                  src={
                    event.bannerUrl ||
                    `https://picsum.photos/seed/${event._id}/800/400`
                  }
                  alt={event.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-md ${
                      isUpcoming
                        ? "bg-white text-green-600"
                        : "bg-gray-800 text-white"
                    } shadow-sm`}
                  >
                    {event.status}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs font-semibold text-primary-600 mb-1 uppercase tracking-wide">
                  {event.eventType}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {event.name}
                </h3>

                <div className="space-y-2 mt-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Icons.Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {new Date(event.startTime).toLocaleDateString()} •{" "}
                    {new Date(event.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Icons.MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="font-medium mr-1">Tổ chức:</span>{" "}
                    {organizer ? organizer.fullname : "N/A"}
                  </div>
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    Chi tiết <Icons.ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredEvents.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Không tìm thấy sự kiện nào.
          </div>
        )}
      </div>

      {/* --- CREATE EVENT MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCreateModalOpen(false)}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Tạo Sự Kiện Mới
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)}>
                <Icons.X className="w-5 h-5 text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form
                id="create-event-form"
                onSubmit={handleCreateEvent}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sự kiện
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
                    Loại hình
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType || "Lễ lớn"}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Lễ lớn">Lễ lớn</option>
                    <option value="Họp nội bộ">Họp nội bộ</option>
                    <option value="Hoạt động thanh niên">
                      Hoạt động thanh niên
                    </option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    value={formData.status || EventStatus.UPCOMING}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value={EventStatus.UPCOMING}>
                      {EventStatus.UPCOMING}
                    </option>
                    <option value={EventStatus.ONGOING}>
                      {EventStatus.ONGOING}
                    </option>
                    <option value={EventStatus.COMPLETED}>
                      {EventStatus.COMPLETED}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian bắt đầu
                  </label>
                  <input
                    name="startTime"
                    type="datetime-local"
                    required
                    value={
                      formData.startTime ? formData.startTime.slice(0, 16) : ""
                    }
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian kết thúc
                  </label>
                  <input
                    name="endTime"
                    type="datetime-local"
                    required
                    value={
                      formData.endTime ? formData.endTime.slice(0, 16) : ""
                    }
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa điểm
                  </label>
                  <input
                    name="location"
                    type="text"
                    value={formData.location || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trưởng Ban Tổ Chức
                  </label>
                  <select
                    name="organizerId"
                    value={formData.organizerId || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">-- Chọn Người --</option>
                    {MOCK_PERSONALS.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.fullname}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="create-event-form"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                {isSaving ? "Đang tạo..." : "Tạo sự kiện"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EVENT DETAIL MODAL --- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          ></div>
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            {/* ... Detail Modal Content (Unchanged) ... */}
            {/* Header with Banner */}
            <div className="relative h-48 bg-gray-900 rounded-t-2xl shrink-0 overflow-hidden">
              <img
                src={
                  selectedEvent.bannerUrl ||
                  `https://picsum.photos/seed/${selectedEvent._id}/800/400`
                }
                className="w-full h-full object-cover opacity-60"
                alt="Event Banner"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded mb-2 uppercase">
                      {selectedEvent.eventType}
                    </span>
                    <h2 className="text-3xl font-bold text-white mb-1">
                      {selectedEvent.name}
                    </h2>
                    <p className="text-gray-300 flex items-center text-sm">
                      <Icons.MapPin className="w-4 h-4 mr-1" />{" "}
                      {selectedEvent.location}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md mb-auto"
                  >
                    <Icons.X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 px-6 shrink-0">
              <nav className="flex space-x-8">
                {[
                  { id: "info", label: "Thông tin chung", icon: Icons.Info },
                  { id: "organizers", label: "Ban Tổ Chức", icon: Icons.Users },
                  {
                    id: "participants",
                    label: "Danh sách đăng ký",
                    icon: Icons.FileText,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                                    py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors
                                    ${
                                      activeTab === tab.id
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }
                                `}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {/* TAB: GENERAL INFO */}
              {activeTab === "info" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 text-lg">
                        Mô tả sự kiện
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {selectedEvent.description ||
                          "Chưa có mô tả chi tiết cho sự kiện này."}
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 text-lg">
                        Timeline dự kiến
                      </h3>
                      <ul className="space-y-4">
                        <li className="flex gap-4">
                          <div className="w-24 text-right font-bold text-blue-600">
                            {new Date(
                              selectedEvent.startTime
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="border-l-2 border-blue-100 pl-4">
                            <p className="font-medium text-gray-800">
                              Khai mạc
                            </p>
                          </div>
                        </li>
                        <li className="flex gap-4">
                          <div className="w-24 text-right font-bold text-blue-600">
                            {new Date(selectedEvent.endTime).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </div>
                          <div className="border-l-2 border-blue-100 pl-4">
                            <p className="font-medium text-gray-800">
                              Kết thúc sự kiện
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase text-gray-500">
                        Thời gian & Địa điểm
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
                            <Icons.Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Ngày bắt đầu
                            </p>
                            <p className="font-medium text-gray-900">
                              {new Date(
                                selectedEvent.startTime
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 mr-3">
                            <Icons.Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Giờ</p>
                            <p className="font-medium text-gray-900">
                              {new Date(
                                selectedEvent.startTime
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 mr-3">
                            <Icons.Users className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Quy mô</p>
                            <p className="font-medium text-gray-900">
                              {selectedEvent.participantsCount} người tham gia
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                      <p className="text-blue-800 text-sm font-medium mb-1">
                        Trạng thái sự kiện
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-900">
                          {selectedEvent.status}
                        </span>
                        <Icons.CheckCircle className="w-8 h-8 text-blue-500 opacity-50" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ORGANIZERS */}
              {activeTab === "organizers" && (
                <div className="space-y-6">
                  {/* Main Organizer */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                      Trưởng Ban Tổ Chức
                    </h3>
                    {(() => {
                      const mainOrg = getOrganizer(selectedEvent);
                      return mainOrg ? (
                        <div className="flex items-center">
                          <img
                            src={mainOrg.avatarUrl}
                            className="w-16 h-16 rounded-full border-2 border-white shadow-md mr-4"
                            alt=""
                          />
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              {mainOrg.fullname}
                            </h4>
                            <p className="text-blue-600">{mainOrg.position}</p>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Icons.Phone className="w-3 h-3 mr-1" />{" "}
                                {mainOrg.phoneNumber}
                              </span>
                              <span className="flex items-center">
                                <Icons.Mail className="w-3 h-3 mr-1" />{" "}
                                contact@email.com
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          Chưa cập nhật thông tin
                        </p>
                      );
                    })()}
                  </div>

                  {/* Committee Members List */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
                      Thành viên Ban Tổ Chức
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getCommitteeMembers().map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
                        >
                          <img
                            src={member.avatarUrl}
                            className="w-12 h-12 rounded-full mr-3 bg-gray-200 object-cover"
                            alt=""
                          />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {member.fullname}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.position || "Thành viên"}
                            </p>
                          </div>
                        </div>
                      ))}
                      <button className="flex items-center justify-center p-3 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all">
                        <Icons.Plus className="w-5 h-5 mr-2" /> Thêm thành viên
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PARTICIPANTS */}
              {activeTab === "participants" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                      <h3 className="font-bold text-gray-800">
                        Danh sách đăng ký
                      </h3>
                      <p className="text-xs text-gray-500">
                        Tổng cộng: {participants.length} người
                      </p>
                    </div>
                    <button
                      onClick={handleExportExcel}
                      className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700 shadow-sm transition-colors"
                    >
                      <Icons.FileSpreadsheet className="w-4 h-4 mr-2" />
                      Xuất Excel
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            STT
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Họ và Tên
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Thông tin liên hệ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Thời gian đăng ký
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {participants.map((p, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {idx + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mr-3">
                                  {p.fullname.charAt(0)}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {p.fullname}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {p.position}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {p.phoneNumber || "---"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {p.address}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(p.registerDate).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  p.checkInStatus === "Đã điểm danh"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {p.checkInStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
