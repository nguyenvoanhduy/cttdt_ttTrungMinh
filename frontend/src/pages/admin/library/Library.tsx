/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import * as Icons from "@/components/Icons";
import { MOCK_BOOKS, MOCK_SONGS, MOCK_VIDEOS } from "@/constants";
import type { Book, Song, Video } from "@/types";

export const Library = () => {
  // Configuration similar to PublicLibraryPage
  const LIBRARY_TABS = [
    {
      id: "thanh_giao",
      label: "Thánh Giáo",
      icon: Icons.BookOpen,
      type: "book",
    },
    { id: "su_dao", label: "Sử Đạo", icon: Icons.FileClock, type: "book" },
    {
      id: "sach_tap_san",
      label: "Sách & tập san",
      icon: Icons.Library,
      type: "book",
    },
    {
      id: "giao_ly_nhac_dao",
      label: "Giáo lý nhạc đạo",
      icon: Icons.Music,
      type: "music",
    },
    {
      id: "video",
      label: "Video từ youtube",
      icon: Icons.Youtube,
      type: "video",
    },
  ];

  const [activeTabId, setActiveTabId] = useState("thanh_giao");
  const [searchTerm, setSearchTerm] = useState(""); // Search State
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [songs, setSongs] = useState<Song[]>(MOCK_SONGS);
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);

  // Derived state
  const activeTabInfo =
    LIBRARY_TABS.find((t) => t.id === activeTabId) || LIBRARY_TABS[0];
  const activeType = activeTabInfo.type; // 'book' | 'music' | 'video'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddClick = () => {
    setFormData({});
    setIsModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({
          ...prev,
          coverImageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTriggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = (id: string, type: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục này không?")) return;

    if (type === "book") {
      setBooks((prev) => prev.filter((b) => b._id !== id));
    } else if (type === "music") {
      setSongs((prev) => prev.filter((s) => s._id !== id));
    } else if (type === "video") {
      setVideos((prev) => prev.filter((v) => v._id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      const newItemId = Date.now().toString();

      if (activeType === "book") {
        const newBook: Book = {
          _id: newItemId,
          title: formData.title || "Tài liệu mới",
          categories: formData.category ? [formData.category] : ["Giáo lý"],
          uploadedBy: "u1",
          uploadDate: new Date().toISOString(),
          fileUrl: "#",
          fileType: "pdf",
          downloadCount: 0,
          viewCount: 0,
          description: formData.description,
          coverImageUrl: formData.coverImageUrl,
        };
        setBooks((prev) => [newBook, ...prev]);
      } else if (activeType === "music") {
        const newSong: Song = {
          _id: newItemId,
          title: formData.title || "Bài hát mới",
          category: formData.category || "Thánh ca",
          uploadedBy: "u1",
          uploadDate: new Date().toISOString(),
          audioUrl: "#",
          duration: 300,
          playCount: 0,
          coverImageUrl: formData.coverImageUrl || "https://picsum.photos/200",
        };
        setSongs((prev) => [newSong, ...prev]);
      } else if (activeType === "video") {
        const newVideo: Video = {
          _id: newItemId,
          title: formData.title || "Video mới",
          description: formData.description,
          youtubeId: formData.youtubeId || "dQw4w9WgXcQ",
          uploadedBy: "u1",
          uploadDate: new Date().toISOString(),
          category: formData.category || "Khác",
          viewCount: 0,
        };
        setVideos((prev) => [newVideo, ...prev]);
      }

      setIsSaving(false);
      setIsModalOpen(false);
      setFormData({});
    }, 800);
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Thư viện</h1>
          <p className="text-gray-500 text-sm">
            Kho lưu trữ tài liệu, âm nhạc và video
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
              placeholder="Tìm kiếm..."
              className="block w-full md:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm w-fit whitespace-nowrap"
          >
            <Icons.Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <nav className="-mb-px flex space-x-6 min-w-max">
          {LIBRARY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                activeTabId === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {/* BOOKS VIEW */}
        {activeType === "book" && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {books
              .filter((b) =>
                b.title.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((book) => (
                <div
                  key={book._id}
                  className="group relative bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all overflow-hidden flex flex-col"
                >
                  <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    {book.coverImageUrl ? (
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : book.fileType === "pdf" ? (
                      <Icons.FileText className="w-12 h-12 text-red-400" />
                    ) : (
                      <Icons.File className="w-12 h-12 text-blue-400" />
                    )}

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={() => handleDelete(book._id, "book")}
                        className="bg-white/90 text-red-600 p-1.5 rounded-full hover:bg-red-50 shadow-sm"
                      >
                        <Icons.Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h4
                      className="font-semibold text-gray-800 text-sm truncate mb-1"
                      title={book.title}
                    >
                      {book.title}
                    </h4>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{book.downloadCount} tải</span>
                        <span>
                          {new Date(book.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {book.categories.map((c) => (
                          <span
                            key={c}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {/* Add Placeholder */}
            <div
              onClick={handleAddClick}
              className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-4 text-gray-400 hover:border-primary-500 hover:text-primary-500 cursor-pointer transition-colors aspect-[3/4]"
            >
              <Icons.Plus className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Thêm sách</span>
            </div>
          </div>
        )}

        {/* MUSIC VIEW */}
        {activeType === "music" && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <ul className="divide-y divide-gray-100">
              {songs
                .filter((s) =>
                  s.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((song, idx) => (
                  <li
                    key={song._id}
                    className="p-4 flex items-center hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-gray-400 w-8 text-center text-sm font-medium">
                      {idx + 1}
                    </span>
                    <div className="h-10 w-10 rounded-md bg-gray-200 overflow-hidden flex-shrink-0 mx-4">
                      <img
                        src={song.coverImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {song.title}
                      </p>
                      <p className="text-xs text-gray-500">{song.category}</p>
                    </div>
                    <div className="text-xs text-gray-400 mx-4">
                      {Math.floor(song.duration / 60)}:
                      {String(song.duration % 60).padStart(2, "0")}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(song._id, "music")}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icons.Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              {songs.length === 0 && (
                <li className="p-8 text-center text-gray-500">
                  Chưa có bài hát nào.
                </li>
              )}
            </ul>
          </div>
        )}

        {/* VIDEO VIEW */}
        {activeType === "video" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos
              .filter((v) =>
                v.title.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((video) => (
                <div
                  key={video._id}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="relative aspect-video bg-gray-100">
                    <img
                      src={
                        video.thumbnailUrl ||
                        `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
                      }
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(video._id, "video")}
                        className="bg-black/50 text-white p-1.5 rounded-full hover:bg-red-600 backdrop-blur-sm"
                      >
                        <Icons.Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4
                      className="font-bold text-gray-900 line-clamp-2 text-sm mb-1"
                      title={video.title}
                    >
                      {video.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {video.category}
                    </p>
                    <div className="flex items-center text-xs text-gray-400">
                      <Icons.Users className="w-3 h-3 mr-1" /> {video.viewCount}{" "}
                      views
                    </div>
                  </div>
                </div>
              ))}

            {/* Add Placeholder for Video */}
            <div
              onClick={handleAddClick}
              className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-4 text-gray-400 hover:border-primary-500 hover:text-primary-500 cursor-pointer transition-colors min-h-[200px]"
            >
              <Icons.Youtube className="w-10 h-10 mb-2" />
              <span className="text-sm font-medium">Thêm Video mới</span>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] relative flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                {activeType === "book" && (
                  <Icons.BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                )}
                {activeType === "music" && (
                  <Icons.Music className="w-5 h-5 mr-2 text-pink-600" />
                )}
                {activeType === "video" && (
                  <Icons.Youtube className="w-5 h-5 mr-2 text-red-600" />
                )}

                {activeType === "book"
                  ? "Thêm Tài liệu"
                  : activeType === "music"
                  ? "Thêm Bài hát"
                  : "Thêm Video"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <Icons.X className="w-5 h-5 text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form
                id="create-resource-form"
                onSubmit={handleSave}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề
                  </label>
                  <input
                    required
                    name="title"
                    type="text"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={
                      activeType === "video"
                        ? "Tiêu đề video..."
                        : "Nhập tiêu đề..."
                    }
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục
                  </label>
                  <select
                    name="category"
                    value={formData.category || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {activeType === "book" && (
                      <>
                        <option value="Thánh Giáo">Thánh Giáo</option>
                        <option value="Sử Đạo">Sử Đạo</option>
                        <option value="Sách">Sách</option>
                        <option value="Tập san">Tập san</option>
                        <option value="Giáo lý">Giáo lý</option>
                      </>
                    )}
                    {activeType === "music" && (
                      <>
                        <option value="Giáo lý nhạc đạo">
                          Giáo lý nhạc đạo
                        </option>
                        <option value="Thánh ca">Thánh ca</option>
                        <option value="Nhạc lễ">Nhạc lễ</option>
                      </>
                    )}
                    {activeType === "video" && (
                      <>
                        <option value="Thuyết Đạo">Thuyết Đạo</option>
                        <option value="Lễ Hội">Lễ Hội</option>
                        <option value="Nghi Lễ">Nghi Lễ</option>
                        <option value="Khác">Khác</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Type Specific Fields */}
                {activeType === "video" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube Video ID
                    </label>
                    <input
                      required
                      name="youtubeId"
                      type="text"
                      value={formData.youtubeId || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="VD: dQw4w9WgXcQ"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nhập ID video từ đường dẫn YouTube (sau v=)
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ảnh bìa
                      </label>
                      <div
                        onClick={handleTriggerFileUpload}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors relative overflow-hidden h-32 bg-gray-50"
                      >
                        {formData.coverImageUrl ? (
                          <img
                            src={formData.coverImageUrl}
                            className="w-full h-full object-cover absolute inset-0 rounded-lg"
                            alt="Preview"
                          />
                        ) : (
                          <>
                            <Icons.Image className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">
                              Tải ảnh bìa
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer mt-4">
                      <Icons.Upload className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Kéo thả file nội dung vào đây hoặc click để chọn
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activeType === "book" ? "PDF, DOCX" : "MP3, WAV"}
                      </p>
                    </div>
                  </>
                )}

                {/* Description for Books and Videos */}
                {(activeType === "book" || activeType === "video") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả ngắn
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    ></textarea>
                  </div>
                )}
              </form>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="create-resource-form"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                {isSaving ? "Đang lưu..." : "Lưu lại"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
