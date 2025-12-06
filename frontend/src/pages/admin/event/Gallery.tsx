import React, { useState, useRef } from "react";
import * as Icons from "@/components/Icons";
import { MOCK_EVENTS } from "@/constants";

interface GalleryImage {
  id: string;
  src: string;
  caption: string;
}

interface Album {
  id: string;
  title: string;
  coverImage: string;
  date?: string;
  count: number;
  isEvent: boolean;
}

export const GalleryManagement = () => {
  // 1. Prepare Data: Albums derived from Events + General Album
  const eventAlbums: Album[] = MOCK_EVENTS.map((event) => ({
    id: event._id,
    title: event.name,
    coverImage:
      event.bannerUrl || `https://picsum.photos/seed/${event._id}/800/600`,
    date: event.startTime,
    count: Math.floor(Math.random() * 10) + 2,
    isEvent: true,
  }));

  const generalAlbum: Album = {
    id: "general",
    title: "Hoạt động thường nhật",
    coverImage: "https://picsum.photos/seed/daily-life/800/600",
    count: 24,
    isEvent: false,
  };

  const [albums] = useState<Album[]>([generalAlbum, ...eventAlbums]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  // Mock images for the selected album
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images when album changes (Simulation)
  React.useEffect(() => {
    if (selectedAlbumId) {
      const album = albums.find((a) => a.id === selectedAlbumId);
      if (album) {
        const mockImages = Array.from({ length: album.count }).map(
          (_, idx) => ({
            id: `${album.id}-${idx}`,
            src: `https://picsum.photos/seed/${album.id}_img_${idx}/800/600`,
            caption: `${album.title} - Ảnh ${idx + 1}`,
          })
        );
        setImages(mockImages);
      }
    } else {
      setImages([]);
    }
  }, [selectedAlbumId, albums]);

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);

      // Simulate upload process
      setTimeout(() => {
        const newImages: GalleryImage[] = Array.from(files).map(
          (file, idx) => ({
            id: `new-${Date.now()}-${idx}`,
            src: URL.createObjectURL(file), // Create local preview
            caption: file.name,
          })
        );

        setImages((prev) => [...newImages, ...prev]);
        setIsUploading(false);

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 1500);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteImage = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa ảnh này?")) {
      setImages((prev) => prev.filter((img) => img.id !== id));
    }
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý Thư viện ảnh
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Tải lên và quản lý hình ảnh cho các Album sự kiện
          </p>
        </div>

        {/* Album Selector */}
        <div className="w-full md:w-auto">
          <select
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            value={selectedAlbumId || ""}
            onChange={(e) => setSelectedAlbumId(e.target.value)}
          >
            <option value="">-- Chọn Album để quản lý --</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} {a.isEvent ? "(Sự kiện)" : "(Thường nhật)"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      {selectedAlbumId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Toolbar */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center">
              <Icons.Image className="w-5 h-5 mr-2 text-blue-500" />
              Danh sách ảnh ({images.length})
            </h3>

            <div className="flex gap-2">
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleBulkUpload}
              />
              <button
                onClick={handleTriggerUpload}
                disabled={isUploading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <Icons.Upload className="w-4 h-4 mr-2" />
                    Tải ảnh lên (Nhiều ảnh)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Upload Placeholder (also trigger) */}
            <div
              onClick={handleTriggerUpload}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-500"
            >
              <Icons.Plus className="w-8 h-8 mb-2" />
              <span className="text-xs font-medium">Thêm ảnh</span>
            </div>

            {images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50"
              >
                <img
                  src={img.src}
                  alt="Gallery"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    className="p-2 bg-white/90 rounded-full text-blue-600 hover:text-blue-800"
                    title="Xem"
                  >
                    <Icons.Search className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteImage(img.id)}
                    className="p-2 bg-white/90 rounded-full text-red-600 hover:text-red-800"
                    title="Xóa"
                  >
                    <Icons.Trash className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 text-center">
                  <p className="text-[10px] text-white truncate px-1">
                    {img.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
            <Icons.Image className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Chưa chọn Album
          </h3>
          <p className="text-gray-500 max-w-md text-center">
            Vui lòng chọn một Album sự kiện hoặc Album thường nhật từ danh sách
            phía trên để bắt đầu quản lý hình ảnh.
          </p>
        </div>
      )}
    </div>
  );
};
