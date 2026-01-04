/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// admin/event/Events.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as Icons from '@/components/Icons';
import { EventStatus, EventStatusLabel, type Event } from '@/types';
import * as XLSX from 'xlsx';
import { eventService } from "@/services/eventService";
import { eventTypeService,type EventType } from "@/services/eventTypeService";
import { personalService } from "@/services/personalService";
import { type Personal } from '@/types';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { uploadImage } from '@/services/uploadService';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ScheduleItem {
  time: string;
  activity: string;
}

export const EventPage = () => {
    const { toasts, removeToast, success, error: showError } = useToast();
    const [events, setEvents] = useState<Event[]>([]);
    const [filter, setFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [members, setMembers] = useState<Personal[]>([]);

  /* ===== EVENT TYPES ===== */
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isManagingTypes, setIsManagingTypes] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState("");

  /* ===== MODAL ===== */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [imageSource, setImageSource] = useState<"url" | "upload">("url");
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });

  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState = {
  name: "",
  eventType: "",
  startTime: "",
  endTime: "",
  location: "",
  organizer: "",
  members: [],   // ✅ BẮT BUỘC
  bannerUrl: "",
  description: "",
  schedule: [] as ScheduleItem[],
};

  const [formData, setFormData] = useState<any>(initialFormState);

  /* ===== DATE VALIDATION & STATUS CALCULATION ===== */
  const validateDates = (startTime: string, endTime: string): string | null => {
    if (!startTime || !endTime) {
      return "Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc";
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Kiểm tra ngày bắt đầu phải trước ngày kết thúc
    if (start >= end) {
      return "Thời gian bắt đầu phải trước thời gian kết thúc";
    }

    return null; // Hợp lệ
  };

  const calculateEventStatus = (startTime: Date | string, endTime: Date | string): EventStatus => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return EventStatus.UPCOMING; // Sắp diễn ra
    } else if (now >= start && now <= end) {
      return EventStatus.ONGOING; // Đang diễn ra
    } else {
      return EventStatus.COMPLETED; // Đã hoàn thành
    }
  };

  /* ===== FETCH DATA ===== */
  useEffect(() => {
    fetchEvents();
    fetchMembers();
    fetchEventTypes();
  }, []);

  const fetchEvents = async () => {
    const res = await eventService.getAll();
    // Tự động cập nhật trạng thái dựa trên thời gian hiện tại
    const eventsWithUpdatedStatus = res.data.map((event: Event) => ({
      ...event,
      status: calculateEventStatus(event.startTime, event.endTime)
    }));
    setEvents(eventsWithUpdatedStatus);
  };

  const fetchMembers = async () => {
    const res = await personalService.getAll();
    setMembers(res.data);
  };

  const fetchEventTypes = async () => {
    const res = await eventTypeService.getAll();
    setEventTypes(res.data);
    if (!formData.eventType && res.data.length) {
      setFormData((p: any) => ({ ...p, eventType: res.data[0]._id }));
    }
  };

  /* ===== FILTER ===== */
  const filteredEvents = useMemo(() => {
    let result = events;
    
    // Filter by status
    if (filter !== "All") {
      result = result.filter((e) => e.status === filter);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter((e) => 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return result;
  }, [events, filter, searchQuery]);

  const filteredMembers = useMemo(() => {
    return members.filter(
      (p) =>
        p.fullname.toLowerCase().includes(memberSearch.toLowerCase()) ||
        (p.department &&
          p.department.toLowerCase().includes(memberSearch.toLowerCase()))
    );
  }, [members, memberSearch]);

  /* ===== HANDLERS ===== */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setEditingEventId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleEditClick = (event: Event) => {
    const toInput = (d?: Date) =>
      d ? new Date(d).toISOString().slice(0, 16) : "";

    setEditingEventId(event._id);
        // Normalize populated fields -> ensure we store IDs (strings) in the form
        const eventTypeId = (event as any).eventType && typeof (event as any).eventType === 'object'
            ? (event as any).eventType._id
            : (event as any).eventType;

        const organizerId = (event as any).organizer && typeof (event as any).organizer === 'object'
            ? (event as any).organizer._id
            : (event as any).organizer;

        const memberIds = (event as any).members
            ? (event as any).members.map((m: any) => (typeof m === 'object' ? m._id : m))
            : [];

        setFormData({
            name: event.name,
            eventType: eventTypeId,
            startTime: toInput(event.startTime),
            endTime: toInput(event.endTime),
            location: event.location,
            bannerUrl: event.bannerUrl || "",
            description: event.description || "",
            organizer: organizerId,
            members: memberIds,
            schedule: (event as any).schedule || [],
        });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    setDeleteConfirm({ open: false, id: '', name: '' });
    
    try {
      await eventService.delete(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      success(' Đã xóa sự kiện thành công');
    } catch (err: any) {
      showError(err.response?.data?.message || "Không thể xóa sự kiện");
    }
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      (e.currentTarget as any).showPicker();
    } catch (err) {
      // Fallback cho trình duyệt cũ
    }
  };

  /* ===== EXPORT TO EXCEL ===== */
  const exportToExcel = (event: Event) => {
    try {
      // Lấy danh sách member IDs
      const memberIds = (event as any).members || [];
      
      // Lọc thông tin chi tiết của từng tín đồ
      const participantsList = memberIds
        .map((memberId: any) => {
          const id = typeof memberId === 'object' ? memberId._id : memberId;
          return members.find(p => p._id === id);
        })
        .filter(Boolean)
        .map((member: any, index: number) => ({
          'STT': index + 1,
          'Họ và Tên': member.fullname,
          'Số điện thoại': (member as any).userPhone || member.phonenumber || '',
          'Chức vụ': member.position || 'Tín đồ',
          'Giới tính': member.gender || '',
          'Trạng thái': member.status || ''
        }));

      // Tạo worksheet
      const ws = XLSX.utils.json_to_sheet(participantsList);
      
      // Tạo workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách tham gia');
      
      // Thêm sheet thông tin sự kiện
      const eventInfo = [{
        'Tên sự kiện': event.name,
        'Loại sự kiện': (event as any).eventType && typeof (event as any).eventType === 'object' 
          ? (event as any).eventType.name 
          : (event as any).eventType,
        'Thời gian': `${new Date(event.startTime).toLocaleString('vi-VN')} - ${new Date(event.endTime).toLocaleString('vi-VN')}`,
        'Địa điểm': event.location,
        'Tổng số tham gia': participantsList.length
      }];
      const wsInfo = XLSX.utils.json_to_sheet(eventInfo);
      XLSX.utils.book_append_sheet(wb, wsInfo, 'Thông tin sự kiện');
      
      // Xuất file
      const fileName = `DanhSachTinDo_${event.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      success('Đã xuất file Excel thành công!');
    } catch (err) {
      console.error('Export error:', err);
      showError('Không thể xuất file Excel');
    }
  };

  /* ===== EVENT TYPE CRUD ===== */
  const addEventType = async () => {
    if (!newTypeInput.trim()) return;
    try {
        const res = await eventTypeService.create(newTypeInput.trim());

        setEventTypes(prev => [...prev, res.data]);
        setFormData((p: any) => ({
        ...p,
        eventType: res.data._id
        }));

        setNewTypeInput("");
        success('Thêm phân loại thành công');
    } catch (err: any) {
        showError(err.response?.data?.message || "Không có quyền");
    }
 };


  const removeEventType = async (id: string) => {
    try {
        await eventTypeService.delete(id);
        setEventTypes(prev => prev.filter(t => t._id !== id));

        if (formData.eventType === id) {
        setFormData((p: any) => ({ ...p, eventType: "" }));
        }
        success('Xóa phân loại thành công');
    } catch (err: any) {
        showError(err.response?.data?.message || 'Không thể xóa phân loại');
    }
 };

  /* ===== FILE ===== */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      const cloudinaryUrl = await uploadImage(file);
      setFormData((p: any) => ({ ...p, bannerUrl: cloudinaryUrl }));
      success('Tải ảnh lên thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      showError('Không thể tải ảnh lên. Vui lòng thử lại.');
      // Fallback to base64 if Cloudinary fails
      const reader = new FileReader();
      reader.onloadend = () =>
        setFormData((p: any) => ({ ...p, bannerUrl: reader.result }));
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  /* ===== SCHEDULE ===== */
  const addScheduleItem = () =>
    setFormData((p: any) => ({
      ...p,
      schedule: [...p.schedule, { time: "", activity: "" }],
    }));

  const updateScheduleItem = (
    i: number,
    field: keyof ScheduleItem,
    value: string
  ) => {
    const s = [...formData.schedule];
    s[i][field] = value;
    setFormData((p: any) => ({ ...p, schedule: s }));
  };

  const removeScheduleItem = (i: number) =>
    setFormData((p: any) => ({
      ...p,
      schedule: p.schedule.filter((_: any, idx: number) => idx !== i),
    }));

  const toggleMembers = (id: string) =>
    setFormData((p: any) => ({
      ...p,
      members: p.members.includes(id)
        ? p.members.filter((x: string) => x !== id)
        : [...p.members, id],
    }));

    const buildPayload = () => ({
    name: formData.name,
    description: formData.description,
    location: formData.location,
    bannerUrl: formData.bannerUrl || undefined,
    eventType: formData.eventType,
    organizer: formData.organizer,
    members: formData.members,
    startTime: new Date(formData.startTime),
    endTime: new Date(formData.endTime),
    schedule: formData.schedule,
  });   
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
        // Basic client-side validation to avoid sending invalid payloads
        // Validate dates
        const dateError = validateDates(formData.startTime, formData.endTime);
        if (dateError) {
            showError(dateError);
            return;
        }

        setIsSaving(true);

        try {
            // normalize potential populated objects to plain ID strings
            const payload = buildPayload();
            if (payload.eventType && typeof payload.eventType === 'object') payload.eventType = (payload.eventType as any)._id;
            if (payload.organizer && typeof payload.organizer === 'object') payload.organizer = (payload.organizer as any)._id;
            payload.members = (payload.members || []).map((m: any) => (typeof m === 'object' ? m._id : m));

            // Tự động tính toán trạng thái
            const calculatedStatus = calculateEventStatus(payload.startTime, payload.endTime);
            const payloadWithStatus = { ...payload, status: calculatedStatus };

            editingEventId
                ? await eventService.update(editingEventId, payloadWithStatus)
                : await eventService.create(payloadWithStatus);

            await fetchEvents();
            setIsModalOpen(false);
            setFormData(initialFormState);
            setEditingEventId(null);
            success(editingEventId ? 'Cập nhật sự kiện thành công' : 'Tạo sự kiện thành công');
        } catch (err: any) {
            console.error('Save error:', err);
            if (err?.response?.data) console.error('Server response:', err.response.data);
            showError(err.response?.data?.message || 'Lỗi lưu sự kiện');
        } finally {
            setIsSaving(false);
        }
  }; 

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="p-8 animate-in fade-in duration-500 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Quản lý Hoạt động & Sự kiện</h1>
           <p className="text-slate-500 text-sm mt-1 font-medium italic">Không gian điều phối chương trình đạo sự của Thánh Thất</p>
        </div>
        <div className="flex gap-3">
             {/* Search Box */}
             <div className="relative">
                <Icons.Search className="absolute left-4 top-8 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input 
                    type="text"
                    placeholder="Tìm kiếm sự kiện..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-11 pr-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <Icons.X className="w-4 h-4" />
                    </button>
                )}
             </div>
             
             <div className="relative">
                <select 
                    className="appearance-none bg-white border border-slate-200 text-slate-700 py-3 px-5 pr-10 rounded-2xl font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="All">Tất cả trạng thái</option>
                    <option value={EventStatus.UPCOMING}>{EventStatusLabel[EventStatus.UPCOMING]}</option>
                    <option value={EventStatus.ONGOING}>{EventStatusLabel[EventStatus.ONGOING]}</option>
                    <option value={EventStatus.COMPLETED}>{EventStatusLabel[EventStatus.COMPLETED]}</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <Icons.ChevronDown className="h-4 w-4" />
                </div>
             </div>
            <button 
              onClick={handleAddClick}
              className="flex items-center px-6 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95"
            >
                <Icons.Plus className="w-5 h-5 mr-2" />
                Tạo Sự Kiện Mới
            </button>
        </div>
      </div>

      {/* Grid view Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredEvents.length === 0 ? (
               <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                   <Icons.Calendar className="w-16 h-16 mb-4 opacity-20" />
                   <p className="text-lg font-bold">
                       {searchQuery ? 'Không tìm thấy sự kiện phù hợp' : 'Chưa có sự kiện nào'}
                   </p>
                   <p className="text-sm mt-1">
                       {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Bấm "Tạo Sự Kiện Mới" để bắt đầu'}
                   </p>
               </div>
           ) : (
               filteredEvents.map(event => {
               const organizerId = (event as any).organizer && typeof (event as any).organizer === 'object'
                ? (event as any).organizer._id
                : (event as any).organizer;
               const organizer = members.find(p => p._id === organizerId);
             
             return (
                <div key={event._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col relative">
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <button 
                            onClick={() => exportToExcel(event)}
                            className="p-3 bg-white/95 text-emerald-600 rounded-2xl shadow-xl hover:bg-emerald-600 hover:text-white transition-all backdrop-blur-sm"
                            title="Xuất Excel"
                        >
                            <Icons.Download className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleEditClick(event)}
                            className="p-3 bg-white/95 text-blue-600 rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-all backdrop-blur-sm"
                        >
                            <Icons.Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDeleteClick(event._id, event.name)}
                            className="p-3 bg-white/95 text-rose-600 rounded-2xl shadow-xl hover:bg-rose-600 hover:text-white transition-all backdrop-blur-sm"
                        >
                            <Icons.Trash className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="relative h-56 overflow-hidden">
                        <img 
                            src={event.bannerUrl || `https://picsum.photos/seed/${event._id}/800/400`} 
                            alt={event.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg shadow-lg ${
                                event.status === EventStatus.UPCOMING ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white'
                            }`}>
                                {EventStatusLabel[event.status as EventStatus]}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex gap-5 mb-6">
                            <div className="text-center min-w-[4rem] bg-blue-50 rounded-2xl p-3 h-fit border border-blue-100 shadow-sm">
                                <span className="block text-[10px] font-black text-blue-400 uppercase tracking-tighter">{new Date(event.startTime).toLocaleString('default', { month: 'short' })}</span>
                                <span className="block text-2xl font-black text-blue-600 leading-none mt-1">{new Date(event.startTime).getDate()}</span>
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-black text-amber-600 uppercase mb-1 tracking-[0.2em]">{(event as any).eventType && typeof (event as any).eventType === 'object' ? (event as any).eventType.name : (event as any).eventType}</div>
                                <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                                    {event.name}
                                </h3>
                            </div>
                        </div>
                        
                        <div className="space-y-3 mb-8 text-slate-500 text-sm font-bold">
                             <div className="flex items-center">
                                <Icons.Clock className="w-4 h-4 mr-3 text-blue-400" />
                                <span>{new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(event.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             </div>
                             <div className="flex items-center">
                                <Icons.MapPin className="w-4 h-4 mr-3 text-blue-400" />
                                <span className="truncate">{event.location}</span>
                             </div>
                        </div>

                        <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <img src={organizer?.avatarUrl} className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100" alt="" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">Phụ trách</span>
                                    <span className="text-xs font-bold text-slate-700">{organizer?.fullname}</span>
                                </div>
                             </div>
                             <div className="flex items-center text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                                <Icons.Users className="w-3.5 h-3.5 mr-1.5" /> {event.participantsCount}
                             </div>
                        </div>
                    </div>
                </div>
             );
        })
           )}
      </div>

      {/* --- MODAL THÊM/SỬA SỰ KIỆN --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isSaving && setIsModalOpen(false)}></div>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl relative flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300 overflow-hidden">
                
                {/* Modal Header */}
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 flex items-center tracking-tight">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mr-5 shadow-inner">
                                {editingEventId ? <Icons.Edit className="w-6 h-6" /> : <Icons.Calendar className="w-6 h-6" />}
                            </div>
                            {editingEventId ? 'Cập Nhật Thông Tin Sự Kiện' : 'Thiết Kế Sự Kiện Mới'}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium mt-0.5 ml-16">
                            {editingEventId ? 'Thay đổi nội dung, thời gian hoặc nhân sự điều phối.' : 'Vui lòng điền đầy đủ các thông tin để ban bố sự kiện.'}
                        </p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="p-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all">
                        <Icons.X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-10 overflow-y-auto bg-slate-50/20">
                    <form id="event-form" onSubmit={handleSave} className="space-y-12">
                        
                        {/* Section 1: Thông tin cơ bản */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            <div className="md:col-span-12">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center">
                                    <span className="w-10 h-px bg-slate-200 mr-4"></span>
                                    Thông tin định danh
                                </h4>
                            </div>

                            <div className="md:col-span-8">
                                <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-wide">Tên sự kiện / Buổi lễ</label>
                                <input 
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="VD: Đại Lễ Vía Đức Chí Tôn..."
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full h-10 px-6 py-4.5 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 shadow-sm"
                                />
                            </div>

                            <div className="md:col-span-4">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wide">Phân loại</label>
                                    <button 
                                      type="button"
                                      onClick={() => setIsManagingTypes(!isManagingTypes)}
                                      className="text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest"
                                    >
                                        {isManagingTypes ? 'Xong' : 'Quản lý'}
                                    </button>
                                </div>
                                <div className="relative">
                                    {isManagingTypes ? (
                                        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text"
                                                    placeholder="Tên loại..."
                                                    value={newTypeInput}
                                                    onChange={(e) => setNewTypeInput(e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-slate-100 rounded-xl text-xs font-bold outline-none bg-slate-50"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={addEventType}
                                                    className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg"
                                                >
                                                    <Icons.Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                {eventTypes.map(t => (
                                                    <div key={t._id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl group border border-slate-100">
                                                        <span className="text-[11px] font-bold text-slate-700">{t.name}</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeEventType(t._id)}
                                                            className="text-slate-300 hover:text-rose-500 transition-all p-1"
                                                        >
                                                            <Icons.Trash className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <select 
                                                name="eventType"
                                                value={formData.eventType}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full h-10 px-6 py-4.5 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 shadow-sm appearance-none cursor-pointer"
                                            >
                                                <option value="">-- Chọn loại sự kiện --</option>
                                                {eventTypes.map(t => (
                                                    <option key={t._id} value={t._id}>{t.name}</option>
                                                ))}
                                            </select>
                                            <Icons.ChevronDown className="absolute right-6 top-7 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-12">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <label className="text-sm font-black text-slate-700 uppercase tracking-wide">Ảnh bìa truyền thông (Banner)</label>
                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        <button 
                                            type="button"
                                            onClick={() => setImageSource('url')}
                                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${imageSource === 'url' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            Link / Drive
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setImageSource('upload')}
                                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${imageSource === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                                        >
                                            Tải ảnh
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-5">
                                    <div className="flex-1">
                                        {imageSource === 'url' ? (
                                            <input 
                                                type="text"
                                                name="bannerUrl"
                                                placeholder="Nhập link ảnh hoặc link Google Drive..."
                                                value={formData.bannerUrl}
                                                onChange={handleInputChange}
                                                className="w-full h-10 px-6 py-4.5 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium text-slate-500 shadow-sm"
                                            />
                                        ) : (
                                            <div 
                                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                                className={`w-full px-6 py-4 bg-white border-2 border-dashed border-slate-200 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all text-slate-400 shadow-sm min-h-[60px] ${
                                                    isUploading ? 'cursor-wait opacity-50' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500'
                                                }`}
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="font-bold text-sm">Đang tải ảnh lên...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Icons.Camera className="w-5 h-5" />
                                                        <span className="font-bold text-sm">Bấm để chọn ảnh từ thiết bị</span>
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
                                        )}
                                    </div>
                                    {formData.bannerUrl && (
                                        <div className="w-40 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-xl shrink-0 group relative">
                                            <img src={formData.bannerUrl} className="w-full h-full object-cover" alt="Preview" />
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({...formData, bannerUrl: ''})}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white"
                                            >
                                                <Icons.X className="w-6 h-6" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Thời gian & Địa điểm */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center">
                                    <span className="w-10 h-px bg-slate-200 mr-4"></span>
                                    Ấn định Thời gian & Địa điểm
                                </h4>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-wide">Thời gian Bắt đầu</label>
                                <div className="relative group">
                                    <Icons.Calendar className="absolute left-6 top-10 -translate-y-1/2 text-blue-500 w-5 h-5 pointer-events-none z-10" />
                                    <DatePicker
                                        selected={formData.startTime ? new Date(formData.startTime) : null}
                                        onChange={(date: Date | null) =>
                                            setFormData((prev: any) => ({ ...prev, startTime: date ? date.toISOString().slice(0, 16) : '' }))
                                        }
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="dd/MM/yyyy HH:mm"
                                        placeholderText="Chọn ngày giờ bắt đầu"
                                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-slate-900 shadow-sm cursor-pointer"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 ml-2 italic">* Nhấn vào ô để mở lịch chọn ngày giờ</p>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-wide">Kết thúc dự kiến</label>
                                <div className="relative group">
                                    <Icons.Calendar className="absolute left-6 top-10 -translate-y-1/2 text-blue-500 w-5 h-5 pointer-events-none z-10" />
                                    <DatePicker
                                        selected={formData.endTime ? new Date(formData.endTime) : null}
                                        onChange={(date: Date | null) =>
                                            setFormData((prev: any) => ({ ...prev, endTime: date ? date.toISOString().slice(0, 16) : '' }))
                                        }
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="dd/MM/yyyy HH:mm"
                                        placeholderText="Chọn ngày giờ kết thúc"
                                        minDate={formData.startTime ? new Date(formData.startTime) : undefined}
                                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-slate-900 shadow-sm cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-wide">Vị trí tổ chức</label>
                                <div className="relative">
                                    <Icons.MapPin className="absolute left-6 top-7 -translate-y-1/2 text-rose-500 w-5 h-5" />
                                    <input 
                                        type="text"
                                        name="location"
                                        required
                                        placeholder="VD: Chánh Điện, Sân Lễ, Văn Phòng..."
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full h-10 pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-slate-900 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Nhân sự */}
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center">
                                <span className="w-10 h-px bg-slate-200 mr-4"></span>
                                Ban Điều hành & Nhân sự
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-wide">Người đứng chính</label>
                                    <div className="relative">
                                        <select 
                                            name="organizer"
                                            required
                                            value={formData.organizer}
                                            onChange={handleInputChange}
                                            className="w-full h-10 px-6 py-4.5 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-slate-900 shadow-sm appearance-none cursor-pointer"
                                        >
                                            <option value="">-- Chọn người phụ trách --</option>
                                            {members.map(p => (
                                                <option key={p._id} value={p._id}>{p.fullname} ({p.position || 'Đạo hữu'})</option>
                                            ))}
                                        </select>
                                        <Icons.ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2 px-1">
                                        <label className="text-sm font-black text-slate-700 uppercase tracking-wide">Thành viên tham gia</label>
                                        <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">Đã chọn {formData.members.length}</span>
                                    </div>
                                    
                                    <div className="bg-white border-2 border-slate-100 rounded-[1.5rem] overflow-hidden shadow-sm flex flex-col h-64 transition-all focus-within:border-blue-200">
                                        <div className="p-3 bg-slate-50 border-b border-slate-100 relative">
                                            <Icons.Search className="absolute left-6 top-10 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input 
                                                type="text"
                                                placeholder="Lọc nhanh tên nhân sự..."
                                                value={memberSearch}
                                                onChange={(e) => setMemberSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500 shadow-inner transition-all"
                                            />
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                            {filteredMembers.length > 0 ? (
                                                filteredMembers.map(p => (
                                                    <label key={p._id} className={`flex items-center p-3 rounded-2xl cursor-pointer transition-all ${formData.members.includes(p._id) ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'}`}>
                                                        <input 
                                                            type="checkbox"
                                                            checked={formData.members.includes(p._id)}
                                                            onChange={() => toggleMembers(p._id)}
                                                            className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                        <div className="ml-4">
                                                            <div className="text-[13px] font-black text-slate-800">{p.fullname}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.position || 'Thành viên'}</div>
                                                        </div>
                                                    </label>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                                    <Icons.Users className="w-10 h-10 mb-2" />
                                                    <p className="text-xs font-bold">Không tìm thấy nhân sự nào</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Lịch trình chi tiết */}
                        <div className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-[0.1em] flex items-center">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mr-4">
                                        <Icons.Clock className="w-5 h-5" />
                                    </div>
                                    Lịch trình / Tiến trình (Timeline)
                                </h4>
                                <button 
                                    type="button"
                                    onClick={addScheduleItem}
                                    className="flex items-center text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-100 active:scale-95"
                                >
                                    <Icons.Plus className="w-4 h-4 mr-2" /> Thêm mốc giờ
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.schedule.length === 0 ? (
                                    <div className="text-center py-12 border-4 border-dashed border-slate-50 rounded-[2rem] flex flex-col items-center justify-center opacity-30">
                                        <Icons.FileText className="w-12 h-12 mb-3" />
                                        <p className="text-slate-500 font-black text-sm uppercase tracking-widest text-center">Bạn chưa thiết lập lịch trình cho sự kiện này</p>
                                    </div>
                                ) : (
                                    formData.schedule.map((item: ScheduleItem, index: number) => (
                                        <div key={index} className="flex gap-5 items-start animate-in slide-in-from-left-4 duration-300">
                                            <div className="w-40 shrink-0">
                                                <div className="relative">
                                                    <DatePicker
                                                        selected={item.time ? (() => {
                                                            const [hours, minutes] = item.time.split(':');
                                                            const date = new Date();
                                                            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                                            return date;
                                                        })() : null}
                                                        onChange={(date: Date | null) => {
                                                            if (date) {
                                                                const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                                                                updateScheduleItem(index, 'time', timeStr);
                                                            }
                                                        }}
                                                        showTimeSelect
                                                        showTimeSelectOnly
                                                        timeIntervals={15}
                                                        timeCaption="Giờ"
                                                        dateFormat="HH:mm"
                                                        placeholderText="HH:mm"
                                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none text-sm font-black text-slate-800 transition-all shadow-inner cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <input 
                                                    type="text"
                                                    placeholder="Ghi tên hoạt động / nghi thức..."
                                                    value={item.activity}
                                                    onChange={(e) => updateScheduleItem(index, 'activity', e.target.value)}
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none text-sm font-bold text-slate-700 transition-all shadow-inner"
                                                />
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => removeScheduleItem(index)}
                                                className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                            >
                                                <Icons.Trash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Mô tả / Nội dung */}
                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-2 ml-1 uppercase tracking-wide">Mô tả tóm tắt / Lưu ý cho đạo hữu</label>
                            <textarea 
                                name="description"
                                rows={5}
                                placeholder="Cung cấp nội dung cốt lõi hoặc các thông báo quan trọng cho người tham dự..."
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-8 py-6 bg-white border border-slate-200 rounded-[2.5rem] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 resize-none shadow-sm"
                            ></textarea>
                        </div>
                    </form>
                </div>

                {/* Modal Footer */}
                <div className="px-10 py-8 bg-white border-t border-slate-100 flex justify-end gap-5 shrink-0">
                    <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)} 
                        className="px-8 py-4 rounded-[1.5rem] text-slate-400 font-black hover:text-slate-600 hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
                        disabled={isSaving}
                    >
                        Hủy thiết lập
                    </button>
                    <button 
                        type="submit" 
                        form="event-form"
                        className="px-10 py-4 bg-blue-600 text-white font-black rounded-[1.5rem] shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-70 flex items-center uppercase text-sm tracking-wider"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin mr-4"></div>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <Icons.CheckCircle className="w-5 h-5 mr-3" /> {editingEventId ? 'Cập nhật sự kiện' : 'Công bố Sự kiện'}
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        /* Tùy chỉnh icon lịch của trình duyệt */
        input[type="datetime-local"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            cursor: pointer;
            opacity: 0;
        }
          `}</style>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteConfirm({ open: false, id: '', name: '' })}
          ></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa sự kiện</h3>
              <p className="text-gray-600 mb-1">Bạn có chắc chắn muốn xóa sự kiện</p>
              <p className="text-lg font-bold text-red-600 mb-4">{deleteConfirm.name}?</p>
              <p className="text-sm text-gray-500">Hành động này không thể hoàn tác.</p>
            </div>
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

      <ToastContainer toasts={toasts} removeToast={removeToast} />
          </div>
        </>
      );
    };
