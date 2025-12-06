import React, { useState } from "react";
import * as Icons from "../components/Icons";
import { MOCK_EVENTS } from "../constants";

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
  location?: string;
}

export const PublicGalleryPage = () => {
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Prepare Data: Albums derived from Events
  const eventAlbums: Album[] = MOCK_EVENTS.map((event) => ({
    id: event._id,
    title: event.name,
    coverImage:
      event.bannerUrl || `https://picsum.photos/seed/${event._id}/800/600`,
    date: event.startTime,
    count: Math.floor(Math.random() * 15) + 5, // Mock number of images
    isEvent: true,
    location: event.location,
  }));

  // 2. Prepare Data: "General" Album for non-event images
  const generalAlbum: Album = {
    id: "general",
    title: "Hoạt động thường nhật",
    coverImage: "https://picsum.photos/seed/daily-life/800/600",
    count: 24,
    isEvent: false,
    location: "Khuôn viên Thánh Thất",
  };

  // Combine all albums (General first or last depending on preference, putting General first here)
  const allAlbums = [generalAlbum, ...eventAlbums];

  // 3. Helper to generate mock images for the active album view
  // In a real app, this would be an API call fetching images by Album ID
  const activeImages: GalleryImage[] = activeAlbum
    ? Array.from({ length: activeAlbum.count }).map((_, idx) => ({
        id: `${activeAlbum.id}-${idx}`,
        src: `https://picsum.photos/seed/${activeAlbum.id}_img_${idx}/800/600`,
        caption: `${activeAlbum.title} - Ảnh ${idx + 1}`,
      }))
    : [];

  // FILTERING LOGIC
  const filteredAlbums = allAlbums.filter(
    (album) =>
      album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (album.location &&
        album.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredImages = activeImages.filter((img) =>
    img.caption.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAlbumClick = (album: Album) => {
    setActiveAlbum(album);
    setSearchTerm(""); // Clear search when entering album
  };

  const handleBackToAlbums = () => {
    setActiveAlbum(null);
    setSearchTerm(""); // Clear search when going back
  };

  return (
    <div className="animate-in fade-in duration-500 min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="bg-blue-900 py-16 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="font-serif text-4xl font-bold mb-4">Thư Viện Ảnh</h1>
          <p className="text-blue-200 text-lg">
            Lưu giữ những khoảnh khắc đẹp của Đạo sự
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-12">
        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icons.Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-shadow"
            placeholder={
              activeAlbum ? "Tìm kiếm ảnh trong album..." : "Tìm kiếm album..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* VIEW 1: ALBUM LIST (Show if no album is selected) */}
        {!activeAlbum && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAlbums.length > 0 ? (
              filteredAlbums.map((album) => (
                <div
                  key={album.id}
                  onClick={() => handleAlbumClick(album)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
                >
                  {/* Cover Image container */}
                  <div className="relative h-64 overflow-hidden bg-gray-200">
                    {/* Stack Effect for Album feel */}
                    <div className="absolute top-0 right-0 left-0 h-full w-full bg-gray-300 rotate-3 scale-95 origin-bottom-left transition-transform group-hover:rotate-6"></div>

                    <div className="relative h-full w-full z-10 bg-white">
                      <img
                        src={album.coverImage}
                        alt={album.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>

                      {/* Badge count */}
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center backdrop-blur-sm shadow-sm">
                        <Icons.Image className="w-3.5 h-3.5 mr-1.5" />
                        {album.count} ảnh
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {album.title}
                    </h3>
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          album.isEvent
                            ? "bg-blue-50 text-blue-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {album.isEvent ? "Sự kiện" : "Album thường nhật"}
                      </span>
                      {album.date && (
                        <span className="flex items-center text-xs">
                          <Icons.Calendar className="w-3 h-3 mr-1" />
                          {new Date(album.date).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                Không tìm thấy album nào phù hợp.
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: ALBUM DETAIL (Show images of selected album) */}
        {activeAlbum && (
          <div className="animate-in slide-in-from-right-4 duration-300">
            {/* Header / Back Navigation */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-gray-200 pb-6">
              <div>
                <button
                  onClick={handleBackToAlbums}
                  className="flex items-center text-gray-500 hover:text-blue-600 mb-3 transition-colors font-medium text-sm group"
                >
                  <div className="p-1 rounded-full bg-gray-100 group-hover:bg-blue-100 mr-2 transition-colors">
                    <Icons.ArrowLeft className="w-4 h-4" />
                  </div>
                  Quay lại danh sách album
                </button>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {activeAlbum.title}
                </h2>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                {activeAlbum.date && (
                  <span className="flex items-center border-r border-gray-200 pr-4">
                    <Icons.Calendar className="w-4 h-4 mr-1.5 text-blue-500" />
                    {new Date(activeAlbum.date).toLocaleDateString("vi-VN")}
                  </span>
                )}
                {activeAlbum.location && (
                  <span className="flex items-center border-r border-gray-200 pr-4">
                    <Icons.MapPin className="w-4 h-4 mr-1.5 text-red-500" />
                    {activeAlbum.location}
                  </span>
                )}
                <span className="flex items-center font-bold text-gray-700">
                  <Icons.Image className="w-4 h-4 mr-1.5" />
                  {activeAlbum.count} hình
                </span>
              </div>
            </div>

            {/* Images Grid */}
            <div className="columns-1 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {filteredImages.length > 0 ? (
                filteredImages.map((img) => (
                  <div
                    key={img.id}
                    className="break-inside-avoid rounded-xl overflow-hidden cursor-pointer group relative shadow-sm hover:shadow-lg transition-all"
                    onClick={() => setLightboxImage(img.src)}
                  >
                    <img
                      src={img.src}
                      alt={img.caption}
                      className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end p-4 opacity-0 group-hover:opacity-100">
                      <p className="text-white text-xs font-medium truncate w-full drop-shadow-md">
                        {img.caption}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  Không tìm thấy hình ảnh nào.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <button className="absolute top-4 right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-50 backdrop-blur-md">
            <Icons.X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            className="max-w-full max-h-[90vh] rounded shadow-2xl animate-in zoom-in-95 duration-300 object-contain"
            alt="Full view"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
