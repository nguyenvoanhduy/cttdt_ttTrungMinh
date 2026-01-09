/* eslint-disable @typescript-eslint/no-unused-vars */
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
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, fileName: '' });
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  
  // Modal State for New Album
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [newAlbumData, setNewAlbumData] = useState<Partial<Album>>({
    date: new Date().toISOString().split('T')[0]
  });
  const [isSavingAlbum, setIsSavingAlbum] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  // Image preview modal
  const [previewImage, setPreviewImage] = useState<{ src: string; caption: string } | null>(null);
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
      setUploadProgress({ current: 0, total: files.length, fileName: '' });
      setError(null);
      const token = getAuthToken();

      // Get existing image numbers to find missing numbers or get next number
      const existingNumbers = images
        .map(img => {
          const match = img.caption.match(/^Hình (\d+)/);
          return match ? parseInt(match[1]) : null;
        })
        .filter((num): num is number => num !== null)
        .sort((a, b) => a - b);

      console.log('Existing numbers:', existingNumbers);

      // Generate next available number (fill gaps first, then continue)
      const getNextAvailableNumber = (): number => {
        // Find first missing number
        for (let i = 1; i <= existingNumbers.length + 1; i++) {
          if (!existingNumbers.includes(i)) {
            existingNumbers.push(i); // Add to list to avoid reuse
            existingNumbers.sort((a, b) => a - b);
            return i;
          }
        }
        // No gaps, get next sequential
        const next = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
        existingNumbers.push(next);
        return next;
      };

      // Upload each file
      const uploadedMedia = [];
      const failedUploads: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress
        setUploadProgress({ current: i + 1, total: files.length, fileName: file.name });
        
        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          failedUploads.push(`${file.name}: Chỉ chấp nhận file ảnh hoặc video`);
          continue;
        }
        
        // Validate file size (max 10MB for images, 100MB for videos)
        const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          failedUploads.push(`${file.name}: Kích thước vượt quá ${file.type.startsWith('video/') ? '100MB' : '10MB'}`);
          continue;
        }
        
        console.log(`[${i + 1}/${files.length}] Uploading: ${file.name}`);
        
        try {
          // Upload to Cloudinary ONLY
          const formData = new FormData();
          formData.append('image', file);
          
          const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText || `HTTP ${uploadResponse.status}` };
            }
            console.error(`Failed to upload ${file.name} to Cloudinary:`, {
              status: uploadResponse.status,
              statusText: uploadResponse.statusText,
              error: errorData
            });
            failedUploads.push(`${file.name}: ${errorData.message || errorData.error || 'Upload lên Cloudinary thất bại'}`);
            continue;
          }

          const uploadResult = await uploadResponse.json();
          console.log(`Upload result for ${file.name}:`, uploadResult);
          
          // Get Cloudinary URL
          const fileUrl = uploadResult.imageUrl || uploadResult.url;
          
          if (!fileUrl) {
            console.error(`No URL in response for ${file.name}:`, uploadResult);
            failedUploads.push(`${file.name}: Không nhận được URL từ Cloudinary`);
            continue;
          }
          
          // Verify it's a Cloudinary URL
          if (!fileUrl.includes('cloudinary.com') && !fileUrl.startsWith('http')) {
            console.error(`Invalid Cloudinary URL for ${file.name}:`, fileUrl);
            failedUploads.push(`${file.name}: URL không hợp lệ từ Cloudinary`);
            continue;
          }
          
          const finalUrl = fileUrl;

          // Step 2: Get next available number and save to database
          const imageNumber = getNextAvailableNumber();
          console.log(`Assigning number ${imageNumber} to ${file.name}`);
          
          const mediaPayload = {
            albumId: selectedAlbumId,
            fileUrl: finalUrl,
            caption: `Hình ${imageNumber}`,
            fileType: file.type.startsWith('video') ? 'video' : 'image',
            altText: `Hình ${imageNumber}`
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
            console.log(`✓ [${i + 1}/${files.length}] ${file.name} → Hình ${imageNumber}`);
          } else {
            // If failed to save, remove the number from used list
            const index = existingNumbers.indexOf(imageNumber);
            if (index > -1) existingNumbers.splice(index, 1);
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
        const successMsg = uploadedMedia.length > 0 
          ? `✓ ${uploadedMedia.length} ảnh đã tải lên Cloudinary thành công\n` 
          : '';
        const failMsg = `✗ ${failedUploads.length} ảnh thất bại:\n${failedUploads.slice(0, 3).join('\n')}${failedUploads.length > 3 ? `\n... và ${failedUploads.length - 3} ảnh khác` : ''}`;
        setError(successMsg + failMsg);
        if (uploadedMedia.length > 0) {
          success(`Đã upload ${uploadedMedia.length} ảnh lên Cloudinary thành công`);
        }
      } else if (uploadedMedia.length > 0) {
        setError(null);
        success(`Đã upload ${uploadedMedia.length} ảnh lên Cloudinary thành công`);
      } else {
        setError('Không có file nào được tải lên thành công. Vui lòng kiểm tra kết nối Cloudinary.');
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(`Lỗi tải file lên: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0, fileName: '' });
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

      const isEditing = !!editingAlbumId;
      const url = isEditing 
        ? `${API_BASE_URL}/gallery/albums/${editingAlbumId}`
        : `${API_BASE_URL}/gallery/albums`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
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
      const albumData = result.data;
      
      if (isEditing) {
        // Update existing album in list
        setAlbums(prev => prev.map(a => 
          (a._id || a.id) === editingAlbumId ? albumData : a
        ));
        success('Đã cập nhật album thành công');
      } else {
        // Add new album to list
        setAlbums(prev => [albumData, ...prev]);
        const newAlbumId = albumData._id || albumData.id;
        setSelectedAlbumId(newAlbumId);
        success('Đã tạo album mới thành công');
      }
      
      setIsSavingAlbum(false);
      setIsAlbumModalOpen(false);
      setEditingAlbumId(null);
      setNewAlbumData({ date: new Date().toISOString().split('T')[0] });
      setModalError(null);
    } catch (err) {
      console.error('Error saving album:', err);
      const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định';
      setModalError(errorMsg || 'Không thể lưu album. Vui lòng thử lại.');
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
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setModalError('Vui lòng chọn file ảnh hợp lệ');
      if (albumCoverInputRef.current) {
        albumCoverInputRef.current.value = '';
      }
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setModalError('Kích thước ảnh không được vượt quá 10MB');
      if (albumCoverInputRef.current) {
        albumCoverInputRef.current.value = '';
      }
      return;
    }
    
    try {
      setModalError(null);
      setIsUploadingCover(true);
      const token = getAuthToken();
      
      console.log('Uploading cover image:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || `HTTP ${uploadResponse.status}` };
        }
        console.error('Upload failed:', errorData);
        throw new Error(errorData.message || 'Không thể tải ảnh lên');
      }
      
      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);
      
      const imageUrl = uploadResult.imageUrl || uploadResult.url;
      
      if (!imageUrl) {
        console.error('No image URL in response:', uploadResult);
        throw new Error('Không nhận được URL ảnh từ server');
      }
      
      setNewAlbumData(prev => ({ ...prev, coverImage: imageUrl }));
      setModalError(null);
      success('Đã tải ảnh bìa lên thành công');
    } catch (err) {
      console.error('Error uploading cover image:', err);
      const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định';
      setModalError(`Lỗi tải ảnh bìa: ${errorMsg}`);
    } finally {
      setIsUploadingCover(false);
      if (albumCoverInputRef.current) {
        albumCoverInputRef.current.value = '';
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

  const handleEditAlbumClick = (album: Album) => {
    const albumId = album._id || album.id;
    setEditingAlbumId(albumId || null);
    setNewAlbumData({
      title: album.title,
      coverImage: album.coverImage,
      date: album.date || new Date().toISOString().split('T')[0],
      location: album.location,
    });
    setIsAlbumModalOpen(true);
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
                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const album = albums.find(a => (a._id || a.id) === selectedAlbumId);
                                        if (album) handleEditAlbumClick(album);
                                    }}
                                    className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors text-sm font-medium flex items-center"
                                    title="Sửa album"
                                >
                                    <Icons.Edit className="w-4 h-4 mr-1" />
                                    Sửa Album
                                </button>
                                <button
                                    onClick={() => {
                                        const album = albums.find(a => (a._id || a.id) === selectedAlbumId);
                                        if (album) handleDeleteAlbumClick(selectedAlbumId!, album.title);
                                    }}
                                    className="mr-3 px-3 py-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors text-sm font-medium flex items-center"
                                    title="Xóa album"
                                >
                                    <Icons.Trash className="w-4 h-4 mr-1" />
                                    Xóa Album
                                </button>
                            </div>
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
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div> Đang tải {uploadProgress.current}/{uploadProgress.total}</>
                                ) : (
                                    <><Icons.Upload className="w-4 h-4 mr-2" /> Tải ảnh lên</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                {isUploading && uploadProgress.total > 0 && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-900">
                                Đang tải lên Cloudinary: {uploadProgress.current} / {uploadProgress.total}
                            </span>
                            <span className="text-xs text-blue-600">
                                {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                            </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-blue-700 truncate">
                            <Icons.Upload className="w-3 h-3 inline mr-1" />
                            {uploadProgress.fileName}
                        </p>
                    </div>
                )}

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
                                <button 
                                  onClick={() => setPreviewImage({ src: img.src, caption: img.caption })}
                                  className="p-2 bg-white/90 rounded-full text-blue-600 hover:text-blue-800 hover:scale-110 transition-transform"
                                  title="Xem ảnh"
                                >
                                  <Icons.Search className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteImageClick(img.id, img.caption)} 
                                  className="p-2 bg-white/90 rounded-full text-red-600 hover:text-red-800 hover:scale-110 transition-transform"
                                  title="Xóa ảnh"
                                >
                                  <Icons.Trash className="w-4 h-4" />
                                </button>
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
                            {editingAlbumId ? (
                                <><Icons.Edit className="w-5 h-5 mr-2 text-blue-600" />Chỉnh sửa Album</>
                            ) : (
                                <><Icons.FolderPlus className="w-5 h-5 mr-2 text-emerald-600" />Tạo Album Mới</>
                            )}
                        </h3>
                        <button onClick={() => {
                            setIsAlbumModalOpen(false);
                            setEditingAlbumId(null);
                            setNewAlbumData({ date: new Date().toISOString().split('T')[0] });
                        }} disabled={isSavingAlbum} className="text-gray-400 hover:text-red-500">
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
                                    onClick={() => !isUploadingCover && albumCoverInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center transition-colors relative overflow-hidden h-32 ${
                                        newAlbumData.coverImage 
                                            ? 'border-emerald-400 bg-emerald-50/50' 
                                            : 'border-gray-300 bg-gray-50'
                                    } ${
                                        isUploadingCover ? 'cursor-wait opacity-50' : 'cursor-pointer hover:border-emerald-500 hover:bg-emerald-50'
                                    }`}
                                >
                                    {isUploadingCover ? (
                                        <>
                                            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                            <span className="text-sm text-gray-500">Đang tải ảnh lên...</span>
                                        </>
                                    ) : newAlbumData.coverImage ? (
                                        <>
                                            <img 
                                              src={newAlbumData.coverImage} 
                                              className="w-full h-full object-cover absolute inset-0 rounded-lg" 
                                              alt="Cover"
                                              onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                console.error('Failed to load cover image:', newAlbumData.coverImage);
                                              }}
                                            />
                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                                                <div className="opacity-0 hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
                                                    <Icons.Camera className="w-5 h-5 text-gray-700" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Icons.Camera className="w-8 h-8 text-gray-400 mb-2" />
                                            <span className="text-sm text-gray-500">Chọn ảnh bìa</span>
                                            <span className="text-xs text-gray-400 mt-1">Tối đa 10MB</span>
                                        </>
                                    )}
                                    <input type="file" ref={albumCoverInputRef} className="hidden" accept="image/*" onChange={handleAlbumCoverChange} disabled={isUploadingCover} />
                                </div>
                                {newAlbumData.coverImage && !isUploadingCover && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setNewAlbumData(prev => ({ ...prev, coverImage: undefined }));
                                        }}
                                        className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Xóa ảnh bìa
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
                        <button onClick={() => {
                            setIsAlbumModalOpen(false);
                            setEditingAlbumId(null);
                            setNewAlbumData({ date: new Date().toISOString().split('T')[0] });
                        }} disabled={isSavingAlbum} className="px-4 py-2 text-gray-600 text-sm font-medium">Hủy</button>
                        <button type="submit" form="create-album-form" disabled={isSavingAlbum || !newAlbumData.title || isUploadingCover} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 text-sm disabled:opacity-50">
                            {isSavingAlbum ? (editingAlbumId ? 'Đang lưu...' : 'Đang tạo...') : (editingAlbumId ? 'Lưu thay đổi' : 'Tạo Album')}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Image Preview Modal */}
        {previewImage && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={() => setPreviewImage(null)}>
                <button 
                    onClick={() => setPreviewImage(null)}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
                >
                    <Icons.X className="w-6 h-6" />
                </button>
                <div className="max-w-6xl max-h-[90vh] w-full p-4" onClick={(e) => e.stopPropagation()}>
                    <img 
                        src={previewImage.src} 
                        alt={previewImage.caption}
                        className="w-full h-full object-contain rounded-lg"
                    />
                    <div className="mt-4 text-center">
                        <p className="text-white text-lg font-medium">{previewImage.caption}</p>
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
