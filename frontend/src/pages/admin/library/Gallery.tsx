/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */

import React, { useState, useRef, useEffect } from 'react';
import * as Icons from '@/components/Icons';
import type { Album } from '@/types';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';

interface GalleryImage {
  id: string;
  src: string;
  caption: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const GalleryManagement = () => {
  // State quản lý albums
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  
  // Images state
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  
  // Modal State for New Album
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [newAlbumData, setNewAlbumData] = useState<Partial<Album>>({
    date: new Date().toISOString().split('T')[0]
  });
  const [isSavingAlbum, setIsSavingAlbum] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; type: 'photo' | 'album'; name: string }>({ 
    open: false, id: '', type: 'photo', name: '' 
  });
  const { toasts, removeToast, success, error: showError } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const albumCoverInputRef = useRef<HTMLInputElement>(null);

  // Get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    console.log('Token from localStorage:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    return token;
  };

  // Fetch all albums on component mount
  useEffect(() => {
    fetchAlbums();
  }, []);

  // Fetch albums from API
  const fetchAlbums = async () => {
    try {
      setIsLoadingAlbums(true);
      const response = await fetch(`${API_BASE_URL}/gallery/albums`);
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách album');
      }

      const result = await response.json();
      setAlbums(result.data || []);
      console.log('Albums loaded:', result.data?.map((a: any) => ({ id: a._id || a.id, title: a.title })));
      setError(null);
    } catch (err) {
      console.error('Error fetching albums:', err);
      setError('Lỗi tải dữ liệu album');
    } finally {
      setIsLoadingAlbums(false);
    }
  };

  // Load images when album changes
  useEffect(() => {
    if (selectedAlbumId && selectedAlbumId.length > 0) {
      console.log('Fetching media for albumId:', selectedAlbumId);
      fetchMediaByAlbum(selectedAlbumId);
    } else {
      setImages([]);
    }
  }, [selectedAlbumId]);

  // Fetch media files for selected album
  const fetchMediaByAlbum = async (albumId: string) => {
    try {
      setIsLoadingImages(true);
      const response = await fetch(`${API_BASE_URL}/gallery/albums/${albumId}/media`);
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách ảnh');
      }

      const result = await response.json();
      const mediaFiles = result.data
        .filter((media: any) => {
          // Lọc ra blob URLs và URLs không hợp lệ
          const url = media.fileUrl || '';
          const isValid = url && !url.startsWith('blob:') && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'));
          
          // Tự động xóa media có blob URL
          if (!isValid && media._id) {
            handleDeleteImage(media._id).catch(console.error);
          }
          
          return isValid;
        })
        .map((media: any) => ({
          id: media._id,
          src: media.fileUrl,
          caption: media.caption || media.altText || 'Ảnh không tên'
        }));
      
      setImages(mediaFiles);
      setError(null);
    } catch (err) {
      console.error('Error fetching media:', err);
      setError('Lỗi tải dữ liệu ảnh');
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedAlbumId) return;

    try {
      setIsUploading(true);
      setError(null);
      const token = getAuthToken();

      // Upload each file
      const uploadedMedia = [];
      const failedUploads: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Step 1: Upload file to Cloudinary first
        const formData = new FormData();
        formData.append('image', file);
        
        console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);
        
        try {
          // Try Cloudinary upload first
          let uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          // If Cloudinary fails, try local upload as fallback
          if (!uploadResponse.ok) {
            console.warn(`Cloudinary upload failed for ${file.name}, trying local upload...`);
            const localFormData = new FormData();
            localFormData.append('file', file);
            
            uploadResponse = await fetch(`${API_BASE_URL}/upload/content`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: localFormData
            });
          }

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText || `HTTP ${uploadResponse.status}` };
            }
            console.error(`Failed to upload ${file.name}:`, {
              status: uploadResponse.status,
              statusText: uploadResponse.statusText,
              error: errorData
            });
            failedUploads.push(`${file.name}: ${errorData.message || errorData.error || 'Upload failed'}`);
            continue;
          }

          const uploadResult = await uploadResponse.json();
          
          // Handle both Cloudinary and local upload responses
          const fileUrl = uploadResult.imageUrl || uploadResult.url;
          
          if (!fileUrl) {
            console.error(`No URL in response for ${file.name}:`, uploadResult);
            failedUploads.push(`${file.name}: No image URL returned from server`);
            continue;
          }
          
          // Convert local path to full URL if needed
          const finalUrl = fileUrl.startsWith('http') ? fileUrl : `${API_BASE_URL.replace('/api', '')}${fileUrl}`;

          // Step 2: Save media info to database
          const mediaPayload = {
            albumId: selectedAlbumId,
            fileUrl: finalUrl,
            caption: file.name.replace(/\.[^/.]+$/, ''),
            fileType: file.type.startsWith('video') ? 'video' : 'image',
            altText: file.name
          };

          const response = await fetch(`${API_BASE_URL}/gallery/albums/${selectedAlbumId}/media`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(mediaPayload)
          });

          if (response.ok) {
            const result = await response.json();
            uploadedMedia.push(result.data);
          } else {
            const errorData = await response.json().catch(() => ({}));
            failedUploads.push(`${file.name}: ${errorData.message || 'Failed to save to database'}`);
          }
        } catch (err) {
          console.error(`Error processing ${file.name}:`, err);
          failedUploads.push(`${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      if (uploadedMedia.length > 0) {
        // Refresh images list
        await fetchMediaByAlbum(selectedAlbumId);
      }

      // Show success/error messages
      if (failedUploads.length > 0) {
        setError(`Tải lên hoàn tất: ${uploadedMedia.length} thành công, ${failedUploads.length} thất bại.\n${failedUploads.slice(0, 3).join('\n')}${failedUploads.length > 3 ? '\n...' : ''}`);
      } else if (uploadedMedia.length > 0) {
        setError(null);
      } else {
        setError('Không có file nào được tải lên thành công.');
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(`Lỗi tải file lên: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAlbumData.title) {
      setModalError('Vui lòng nhập tên album');
      return;
    }

    try {
      setIsSavingAlbum(true);
      setModalError(null);
      const token = getAuthToken();

      const albumPayload = {
        title: newAlbumData.title,
        coverImage: newAlbumData.coverImage || null,
        date: newAlbumData.date,
        location: newAlbumData.location,
        description: newAlbumData.location
      };

      const response = await fetch(`${API_BASE_URL}/gallery/albums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(albumPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Add new album to list
      const newAlbum = result.data;
      setAlbums(prev => [newAlbum, ...prev]);
      setIsSavingAlbum(false);
      setIsAlbumModalOpen(false);
      setNewAlbumData({ date: new Date().toISOString().split('T')[0] });
      
      const newAlbumId = newAlbum._id || newAlbum.id;
      console.log('New album created with ID:', newAlbumId);
      setSelectedAlbumId(newAlbumId);
      setModalError(null);
    } catch (err) {
      console.error('Error creating album:', err);
      const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định';
      setModalError(errorMsg || 'Không thể tạo album. Vui lòng thử lại.');
      setIsSavingAlbum(false);
    }
  };

  // Compress image to reduce payload size
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Limit dimensions to max 400x400
          if (width > height) {
            if (width > 400) {
              height *= 400 / width;
              width = 400;
            }
          } else {
            if (height > 400) {
              width *= 400 / height;
              height = 400;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 70% quality
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleAlbumCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setModalError(null);
        const compressedImage = await compressImage(file);
        setNewAlbumData(prev => ({ ...prev, coverImage: compressedImage }));
        setModalError(null);
      } catch (err) {
        console.error('Error compressing image:', err);
        setModalError('Lỗi xử lý ảnh. Vui lòng thử lại.');
      }
    }
  };

  const handleDeleteImageClick = (id: string, caption: string) => {
    setDeleteConfirm({ open: true, id, type: 'photo', name: caption || 'ảnh này' });
  };

  const handleDeleteImage = async (id: string) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/gallery/media/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể xóa ảnh');
      }

      // Remove from UI
      setImages(prev => prev.filter(img => img.id !== id));
      setAlbums(prev => prev.map(a => 
        a.id === selectedAlbumId ? { ...a, count: Math.max(0, (a.count || 0) - 1) } : a
      ));
      setError(null);
      success('Đã xóa ảnh thành công');
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Lỗi xóa ảnh');
      showError('Không thể xóa ảnh');
    }
  };

  const handleDeleteAlbumClick = (albumId: string, title: string) => {
    setDeleteConfirm({ open: true, id: albumId, type: 'album', name: title });
  };

  const handleDeleteAlbum = async (albumId: string) => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/gallery/albums/${albumId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể xóa album');
      }

      // Remove from UI
      setAlbums(prev => prev.filter(a => (a._id || a.id) !== albumId));
      if (selectedAlbumId === albumId) {
        setSelectedAlbumId(null);
        setImages([]);
      }
      setError(null);
      success('Đã xóa album thành công');
    } catch (err) {
      console.error('Error deleting album:', err);
      setError('Lỗi xóa album');
      showError('Không thể xóa album');
    }
  };

  const confirmDelete = async () => {
    const { id, type } = deleteConfirm;
    setDeleteConfirm({ open: false, id: '', type: 'photo', name: '' });
    
    if (type === 'photo') {
      await handleDeleteImage(id);
    } else {
      await handleDeleteAlbum(id);
    }
  };

  if (isLoadingAlbums) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-in fade-in duration-500">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 text-blue-900">Quản lý Thư viện ảnh</h1>
                <p className="text-gray-500 text-sm mt-1">Quản lý album và tải hình ảnh lên hệ thống</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                 <button 
                    onClick={() => setIsAlbumModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap text-sm font-bold"
                 >
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Thêm Album mới
                 </button>

                 <select 
                    className="flex-1 md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm"
                    value={selectedAlbumId || ''}
                    onChange={(e) => {
                      const albumId = e.target.value;
                      console.log('Selected album ID:', albumId);
                      setSelectedAlbumId(albumId || null);
                    }}
                 >
                     <option key="empty" value="">-- Chọn Album để quản lý --</option>
                     {albums.map(a => {
                       const albumId = a._id || a.id;
                       return (
                         <option key={albumId} value={albumId}>{a.title}</option>
                       );
                     })}
                 </select>
            </div>
        </div>

        {selectedAlbumId ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 flex-1">
                            <h3 className="font-bold text-gray-800 flex items-center">
                                <Icons.Image className="w-5 h-5 mr-2 text-blue-500" />
                                Danh sách ảnh ({isLoadingImages ? '...' : images.length})
                            </h3>
                            <button
                                onClick={() => {
                                    const album = albums.find(a => (a._id || a.id) === selectedAlbumId);
                                    if (album) handleDeleteAlbumClick(selectedAlbumId!, album.title);
                                }}
                                className="ml-auto mr-3 px-3 py-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors text-sm font-medium flex items-center"
                                title="Xóa album"
                            >
                                <Icons.Trash className="w-4 h-4 mr-1" />
                                Xóa Album
                            </button>
                        </div>
                        
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
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading || isLoadingImages}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors text-sm font-bold disabled:opacity-50"
                            >
                                {isUploading ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Đang tải...</>
                                ) : (
                                    <><Icons.Upload className="w-4 h-4 mr-2" /> Tải ảnh lên</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {isLoadingImages ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="mt-2 text-gray-600 text-sm">Đang tải ảnh...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-500"
                    >
                        <Icons.Plus className="w-8 h-8 mb-2" />
                        <span className="text-xs font-medium">Thêm ảnh</span>
                    </div>

                    {images.map(img => (
                        <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                            <img 
                              src={img.src} 
                              alt={img.caption} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="p-2 bg-white/90 rounded-full text-blue-600 hover:text-blue-800"><Icons.Search className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteImageClick(img.id, img.caption)} className="p-2 bg-white/90 rounded-full text-red-600 hover:text-red-800"><Icons.Trash className="w-4 h-4" /></button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 text-center">
                                <p className="text-[10px] text-white truncate px-1">{img.caption}</p>
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
                <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa chọn Album</h3>
                <p className="text-gray-500 max-w-md text-center text-sm px-6">
                    Vui lòng chọn hoặc thêm album để bắt đầu.
                </p>
            </div>
        )}

        {/* --- NEW ALBUM MODAL --- */}
        {isAlbumModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSavingAlbum && setIsAlbumModalOpen(false)}></div>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative flex flex-col animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <Icons.FolderPlus className="w-5 h-5 mr-2 text-emerald-600" />
                            Tạo Album Mới
                        </h3>
                        <button onClick={() => setIsAlbumModalOpen(false)} disabled={isSavingAlbum} className="text-gray-400 hover:text-red-500">
                            <Icons.X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="p-6">
                        <form id="create-album-form" onSubmit={handleCreateAlbum} className="space-y-4">
                            {modalError && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {modalError}
                              </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Album</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="Nhập tên album..."
                                    value={newAlbumData.title || ''}
                                    onChange={(e) => setNewAlbumData({...newAlbumData, title: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày ghi hình</label>
                                <input 
                                    type="date"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={newAlbumData.date || ''}
                                    onChange={(e) => setNewAlbumData({...newAlbumData, date: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                                <input 
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="VD: Chánh điện..."
                                    value={newAlbumData.location || ''}
                                    onChange={(e) => setNewAlbumData({...newAlbumData, location: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh bìa Album</label>
                                <div 
                                    onClick={() => albumCoverInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors relative overflow-hidden h-32 bg-gray-50"
                                >
                                    {newAlbumData.coverImage ? (
                                        <img 
                                          src={newAlbumData.coverImage} 
                                          className="w-full h-full object-cover absolute inset-0 rounded-lg" 
                                          alt="Cover"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                          }}
                                        />
                                    ) : (
                                        <><Icons.Camera className="w-8 h-8 text-gray-400 mb-2" /><span className="text-sm text-gray-500">Chọn ảnh bìa</span></>
                                    )}
                                    <input type="file" ref={albumCoverInputRef} className="hidden" accept="image/*" onChange={handleAlbumCoverChange} />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
                        <button onClick={() => setIsAlbumModalOpen(false)} disabled={isSavingAlbum} className="px-4 py-2 text-gray-600 text-sm font-medium">Hủy</button>
                        <button type="submit" form="create-album-form" disabled={isSavingAlbum || !newAlbumData.title} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 text-sm">
                            {isSavingAlbum ? 'Đang tạo...' : 'Tạo Album'}
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
                        {deleteConfirm.type === 'album' 
                            ? `Bạn có chắc muốn xóa album "${deleteConfirm.name}"?`
                            : `Bạn có chắc muốn xóa ảnh "${deleteConfirm.name}"?`
                        }
                    </p>
                    {deleteConfirm.type === 'album' && (
                        <p className="text-red-600 text-sm mb-4">
                            ⚠️ Tất cả ảnh trong album sẽ bị xóa. Hành động này không thể hoàn tác!
                        </p>
                    )}
                    {deleteConfirm.type === 'photo' && (
                        <p className="text-gray-500 text-sm mb-4">
                            Hành động này không thể hoàn tác.
                        </p>
                    )}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setDeleteConfirm({ open: false, id: '', type: 'photo', name: '' })}
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
        
        <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
