import React, { useState, useRef, useEffect } from "react";
import * as Icons from "@/components/Icons";
import { eventService } from "@/services/eventService";
import { galleryService, type GalleryAlbum, type MediaFile } from "@/services/galleryService";
import { uploadImage } from "@/services/uploadService";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import type { Event } from "@/types";
import { convertGoogleDriveLink, isGoogleDriveLink } from "@/util/googleDrive";

interface Album {
  id: string;
  title: string;
  coverImage: string;
  date?: string;
  count: number;
  isEvent: boolean;
}

export const GalleryManagement = () => {
  const { toasts, removeToast, success, error: showError } = useToast();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [images, setImages] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Google Drive link input
  const [showDriveLinkInput, setShowDriveLinkInput] = useState(false);
  const [driveLinkInput, setDriveLinkInput] = useState("");
  const [isAddingDriveLink, setIsAddingDriveLink] = useState(false);

  // Fetch albums and events on mount
  useEffect(() => {
    fetchAlbumsAndEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAlbumsAndEvents = async () => {
    try {
      setIsLoadingAlbums(true);
      
      // Fetch events from backend
      const eventsRes = await eventService.getAll();
      const events: Event[] = eventsRes.data || [];
      
      // Fetch existing gallery albums
      const albumsRes = await galleryService.getAllAlbums();
      const existingAlbums: GalleryAlbum[] = albumsRes.data.data || [];
      
      // Create general album if it doesn't exist
      const generalAlbum = existingAlbums.find(a => !a.isEvent);
      if (!generalAlbum) {
        try {
          const newGeneralAlbum = await galleryService.createAlbum({
            title: "Hoạt động thường nhật",
            coverImage: "https://images.unsplash.com/photo-1478147427282-58a87a120781",
            isEvent: false,
            description: "Album chứa các hoạt động thường nhật của Thánh Thất"
          });
          existingAlbums.push(newGeneralAlbum.data.data);
        } catch (err) {
          console.error("Error creating general album:", err);
        }
      }
      
      // Create albums for events that don't have one
      for (const event of events) {
        const eventAlbumExists = existingAlbums.find(a => a.eventId === event._id);
        if (!eventAlbumExists) {
          try {
            const newEventAlbum = await galleryService.createAlbum({
              title: event.name,
              coverImage: event.bannerUrl || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622",
              isEvent: true,
              eventId: event._id,
              date: new Date(event.startTime).toISOString(),
              location: event.location,
              description: `Album ảnh sự kiện: ${event.name}`
            });
            existingAlbums.push(newEventAlbum.data.data);
          } catch (err) {
            console.error(`Error creating album for event ${event.name}:`, err);
          }
        }
      }
      
      // Get media count for each album
      const albumsWithCount = await Promise.all(
        existingAlbums.map(async (album) => {
          try {
            const mediaRes = await galleryService.getMediaByAlbum(album._id);
            return {
              id: album._id,
              title: album.title,
              coverImage: album.coverImage,
              date: album.date,
              count: mediaRes.data.count || 0,
              isEvent: album.isEvent
            };
          } catch {
            return {
              id: album._id,
              title: album.title,
              coverImage: album.coverImage,
              date: album.date,
              count: 0,
              isEvent: album.isEvent
            };
          }
        })
      );
      
      setAlbums(albumsWithCount);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error fetching albums:", error);
      showError(error.response?.data?.message || "Không thể tải danh sách album");
    } finally {
      setIsLoadingAlbums(false);
    }
  };

  // Load images when album changes
  useEffect(() => {
    if (selectedAlbumId) {
      fetchImages(selectedAlbumId);
    } else {
      setImages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlbumId]);

  const fetchImages = async (albumId: string) => {
    try {
      setIsLoadingImages(true);
      const res = await galleryService.getMediaByAlbum(albumId);
      setImages(res.data.data || []);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error fetching images:", error);
      showError(error.response?.data?.message || "Không thể tải danh sách ảnh");
      setImages([]);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedAlbumId) return;

    setIsUploading(true);

    try {
      const uploadedFiles: Array<{ fileUrl: string; caption: string; fileType: string }> = [];
      
      // Upload each file to Cloudinary
      for (const file of Array.from(files)) {
        try {
          const cloudinaryUrl = await uploadImage(file);
          uploadedFiles.push({
            fileUrl: cloudinaryUrl,
            caption: file.name,
            fileType: "image"
          });
        } catch (uploadErr) {
          console.error(`Failed to upload ${file.name}:`, uploadErr);
          showError(`Không thể tải lên ${file.name}`);
        }
      }

      if (uploadedFiles.length === 0) {
        showError("Không có ảnh nào được tải lên thành công");
        return;
      }

      // Save to database
      await galleryService.bulkUploadMedia(selectedAlbumId, uploadedFiles);
      
      // Reload images
      await fetchImages(selectedAlbumId);
      
      // Update album count
      await fetchAlbumsAndEvents();
      
      success(`Đã tải lên ${uploadedFiles.length} ảnh thành công!`);

      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Bulk upload error:", error);
      showError(error.response?.data?.message || "Lỗi tải ảnh lên");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTriggerUpload = () => {
    if (!selectedAlbumId) {
      showError("Vui lòng chọn album trước khi tải ảnh lên");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDeleteImage = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh này?")) return;

    try {
      await galleryService.deleteMedia(id);
      setImages((prev) => prev.filter((img) => img._id !== id));
      
      // Update album count
      await fetchAlbumsAndEvents();
      
      success("Đã xóa ảnh thành công");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Delete error:", error);
      showError(error.response?.data?.message || "Không thể xóa ảnh");
    }
  };

  const handleAddDriveLink = async () => {
    if (!selectedAlbumId) {
      showError("Vui lòng chọn album trước");
      return;
    }

    if (!driveLinkInput.trim()) {
      showError("Vui lòng nhập link Google Drive");
      return;
    }

    if (!isGoogleDriveLink(driveLinkInput)) {
      showError("Link không hợp lệ. Vui lòng nhập link Google Drive");
      return;
    }

    try {
      setIsAddingDriveLink(true);
      
      const directUrl = convertGoogleDriveLink(driveLinkInput);
      if (!directUrl) {
        showError("Không thể chuyển đổi link Google Drive");
        return;
      }

      await galleryService.uploadMedia(selectedAlbumId, {
        fileUrl: directUrl,
        caption: "Ảnh từ Google Drive",
        fileType: "image"
      });

      await fetchImages(selectedAlbumId);
      await fetchAlbumsAndEvents();
      
      success("Đã thêm ảnh từ Google Drive thành công!");
      setDriveLinkInput("");
      setShowDriveLinkInput(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Add drive link error:", error);
      showError(error.response?.data?.message || "Không thể thêm ảnh từ Google Drive");
    } finally {
      setIsAddingDriveLink(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
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
              disabled={isLoadingAlbums}
            >
              <option value="">-- Chọn Album để quản lý --</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} {a.isEvent ? "(Sự kiện)" : "(Thường nhật)"} - {a.count} ảnh
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
                  onClick={() => setShowDriveLinkInput(!showDriveLinkInput)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-colors"
                  title="Thêm ảnh từ Google Drive"
                >
                  <Icons.Link className="w-4 h-4 mr-2" />
                  Google Drive
                </button>
                <button
                  onClick={handleTriggerUpload}
                  disabled={isUploading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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

            {/* Google Drive Link Input */}
            {showDriveLinkInput && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Icons.Link className="w-4 h-4 mr-2 text-green-600" />
                  Thêm ảnh từ Google Drive
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Dán link Google Drive vào đây (ví dụ: https://drive.google.com/file/d/...)"
                    value={driveLinkInput}
                    onChange={(e) => setDriveLinkInput(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    disabled={isAddingDriveLink}
                  />
                  <button
                    onClick={handleAddDriveLink}
                    disabled={isAddingDriveLink || !driveLinkInput.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isAddingDriveLink ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Thêm"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowDriveLinkInput(false);
                      setDriveLinkInput("");
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  💡 Cách lấy link: Mở file trên Google Drive → Nhấn "Chia sẻ" → Chọn "Bất kỳ ai có đường link" → Sao chép link
                </p>
              </div>
            )}

            {/* Images Grid */}
            {isLoadingImages ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
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
                    key={img._id}
                    className="group relative aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50"
                  >
                    <img
                      src={img.fileUrl}
                      alt={img.altText || "Gallery"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        className="p-2 bg-white/90 rounded-full text-blue-600 hover:text-blue-800"
                        title="Xem"
                        onClick={() => window.open(img.fileUrl, '_blank')}
                      >
                        <Icons.Search className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(img._id)}
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
            )}
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
    </>
  );
};
