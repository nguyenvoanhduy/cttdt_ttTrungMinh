/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect } from 'react';
import * as Icons from '@/components/Icons';
import type { Book, Song, Video } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';

interface LibraryTab {
    id: string;
    label: string;
    icon: any;
    type: 'book' | 'music' | 'video';
}

export const Library = () => {
  const { user } = useAuth();
  const { toasts, removeToast, success, error: showError, warning } = useToast();
  
  // 1. Initial Tabs State
  const INITIAL_TABS: LibraryTab[] = [
    { id: 'thanh_giao', label: 'Thánh Giáo', icon: Icons.BookOpen, type: 'book' },
    { id: 'su_dao', label: 'Sử Đạo', icon: Icons.FileClock, type: 'book' },
    { id: 'sach_tap_san', label: 'Sách & tập san', icon: Icons.Library, type: 'book' },
    { id: 'giao_ly', label: 'Giáo lý', icon: Icons.Book, type: 'book' },
    { id: 'nhac_dao', label: 'Nhạc đạo', icon: Icons.Music, type: 'music' },
    { id: 'video', label: 'Video từ youtube', icon: Icons.Youtube, type: 'video' },
  ];

  const [libraryTabs, setLibraryTabs] = useState<LibraryTab[]>(INITIAL_TABS);
  const [activeTabId, setActiveTabId] = useState('thanh_giao');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [books, setBooks] = useState<Book[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);

    // Fetch from API when available; fall back to mocks on error.
    useEffect(() => {
        let mounted = true;
        import('@/services/libraryService').then(({ libraryService }) => {
            libraryService.getBooks().then(res => { if (mounted) setBooks(res.data); }).catch(() => {});
            libraryService.getSongs().then(res => { if (mounted) setSongs(res.data); }).catch(() => {});
            libraryService.getVideos().then(res => { if (mounted) setVideos(res.data); }).catch(() => {});
        }).catch(() => {});
        return () => { mounted = false; };
    }, []);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCategory, setNewTypeCategory] = useState<'book' | 'music' | 'video'>('book');
  
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<'book' | 'music' | 'video' | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; type: 'item' | 'category'; name: string; itemType?: string }>({ 
    open: false, id: '', type: 'item', name: '', itemType: '' 
  });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentFileRef = useRef<HTMLInputElement>(null);

    const handleContentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFormData((prev: any) => ({ ...prev, contentFileName: file.name, contentFile: file }));
    };

    const handleUploadAreaClick = () => {
        contentFileRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        setFormData((prev: any) => ({ ...prev, contentFileName: file.name, contentFile: file }));
    };

  // Derived state
  const activeTabInfo = libraryTabs.find(t => t.id === activeTabId) || libraryTabs[0];
  const activeType = activeTabInfo.type;

  const handleAddClick = () => {
      setFormData({
          category: activeTabInfo.label
      });
      setIsModalOpen(true);
  };

  const handleAddType = () => {
    if (newTypeName.trim()) {
        const id = newTypeName.toLowerCase().replace(/\s+/g, '_');
        const newTab: LibraryTab = {
            id: id,
            label: newTypeName,
            icon: newTypeCategory === 'book' ? Icons.BookOpen : newTypeCategory === 'music' ? Icons.Music : Icons.Youtube,
            type: newTypeCategory
        };
        setLibraryTabs(prev => [...prev, newTab]);
        setNewTypeName('');
        setIsTypeModalOpen(false);
    }
  };

  const handleRemoveType = (id: string) => {
      if (libraryTabs.length <= 1) return;
      const tab = libraryTabs.find(t => t.id === id);
      setDeleteConfirm({ open: true, id, type: 'category', name: tab?.label || '', itemType: '' });
  };

  const handleRemoveTypeConfirmed = (id: string) => {
      setLibraryTabs(prev => prev.filter(t => t.id !== id));
      if (activeTabId === id) setActiveTabId(libraryTabs[0].id);
      success('Đã xóa loại thư mục');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData((prev: any) => ({ ...prev, coverImageUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleTriggerFileUpload = () => {
      fileInputRef.current?.click();
  };

  const handleEdit = (item: any, type: 'book' | 'music' | 'video') => {
      setEditingItem(item);
      setEditingType(type);
      if (type === 'book') {
          setFormData({
              title: item.title,
              category: item.categories[0] || 'Giáo lý',
              description: item.description || '',
              coverImageUrl: item.coverImageUrl,
          });
      } else if (type === 'music') {
          setFormData({
              title: item.title,
              category: item.category || 'Nhạc đạo',
              lyricsUrl: item.lyricsUrl || '',
          });
      } else if (type === 'video') {
          setFormData({
              title: item.title,
              youtubeId: item.youtubeId,
              category: item.category || 'Khác',
              description: item.description || '',
          });
      }
      setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, type: string, title: string) => {
      setDeleteConfirm({ open: true, id, type: 'item', name: title, itemType: type });
  };

  const handleDelete = async (id: string, type: string) => {
      try {
          const { libraryService } = await import('@/services/libraryService');
          if (type === 'book') {
              await libraryService.deleteBook(id);
              setBooks(prev => prev.filter(b => b._id !== id));
              success('Đã xóa sách thành công');
          } else if (type === 'music') {
              await libraryService.deleteSong(id);
              setSongs(prev => prev.filter(s => s._id !== id));
              success('Đã xóa nhạc thành công');
          } else if (type === 'video') {
              await libraryService.deleteVideo(id);
              setVideos(prev => prev.filter(v => v._id !== id));
              success('Đã xóa video thành công');
          }
      } catch (err: any) {
          console.error('Delete error:', err);
          showError(err.response?.data?.message || 'Lỗi xóa mục');
      }
  };

  const confirmDelete = async () => {
    const { id, type, itemType } = deleteConfirm;
    setDeleteConfirm({ open: false, id: '', type: 'item', name: '', itemType: '' });
    
    if (type === 'category') {
      handleRemoveTypeConfirmed(id);
    } else {
      await handleDelete(id, itemType!);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);

      try {
          if (!user) {
              warning('Vui lòng đăng nhập để lưu tài liệu');
              setIsSaving(false);
              return;
          }

          const { libraryService } = await import('@/services/libraryService');

          // Upload cover image if present (only for books, not music)
          let coverImageUrl = formData.coverImageUrl || undefined;
          if (activeType !== 'music' && formData.coverImageUrl && typeof formData.coverImageUrl === 'string' && formData.coverImageUrl.startsWith('data:')) {
              // It's a base64 encoded image from file input - convert to file and upload
              const blob = await fetch(formData.coverImageUrl).then(r => r.blob());
              const file = new File([blob], 'cover.jpg', { type: 'image/jpeg' });
              try {
                  const uploadRes = await libraryService.uploadImage(file);
                  coverImageUrl = uploadRes.data.imageUrl;
              } catch (err) {
                  console.warn('Cover upload failed, skipping:', err);
              }
          }

          // Upload content file if present (audio for music, doc for books)
          let fileUrl = undefined;
          if (formData.contentFile) {
              try {
                  const uploadRes = await libraryService.uploadContent(formData.contentFile);
                  fileUrl = uploadRes.data.url;
              } catch (err) {
                  console.warn('Content upload failed:', err);
              }
          }

          // Upload lyrics file if present (for music)
          let lyricsUrl = undefined;
          if (formData.lyricsFile) {
              try {
                  const uploadRes = await libraryService.uploadContent(formData.lyricsFile);
                  lyricsUrl = uploadRes.data.url;
              } catch (err) {
                  console.warn('Lyrics upload failed:', err);
              }
          }

          // Check if editing or creating
          const isEditing = editingItem && editingType;

          // Create/Update item based on type
          if (activeType === 'book') {
              const bookData: Partial<Book> = {
                  title: formData.title || 'Tài liệu mới',
                  categories: formData.category ? [formData.category] : ['Giáo lý'],
                  description: formData.description || '',
                  coverImageUrl: coverImageUrl,
                  ...(fileUrl && { fileUrl }),
                  ...(formData.contentFile && { fileType: formData.contentFile.name.split('.').pop() || 'pdf' }),
              };

              if (isEditing) {
                  const res = await libraryService.updateBook(editingItem._id, bookData);
                  setBooks(prev => prev.map(b => b._id === editingItem._id ? res.data : b));
              } else {
                  const newBook: Partial<Book> = {
                      ...bookData,
                      uploadedBy: user._id,
                      uploadDate: new Date().toISOString(),
                      fileUrl: fileUrl || '#',
                      fileType: formData.contentFile?.name.split('.').pop() || 'pdf',
                      downloadCount: 0,
                      viewCount: 0,
                  };
                  const res = await libraryService.createBook(newBook);
                  setBooks(prev => [res.data, ...prev]);
              }
          } else if (activeType === 'music') {
              const songData: Partial<Song> = {
                  title: formData.title || 'Bài hát mới',
                  category: formData.category || 'Thánh ca',
                  coverImageUrl: '/dianhac.png',
                  ...(fileUrl && { audioUrl: fileUrl }),
                  ...(lyricsUrl && { lyricsUrl }),
              };

              if (isEditing) {
                  const res = await libraryService.updateSong(editingItem._id, songData);
                  setSongs(prev => prev.map(s => s._id === editingItem._id ? res.data : s));
              } else {
                  const newSong: Partial<Song> = {
                      ...songData,
                      uploadedBy: user._id,
                      uploadDate: new Date().toISOString(),
                      audioUrl: fileUrl || '#',
                      duration: 300,
                      playCount: 0,
                  };
                  const res = await libraryService.createSong(newSong);
                  setSongs(prev => [res.data, ...prev]);
              }
          } else if (activeType === 'video') {
              const videoData: Partial<Video> = {
                  title: formData.title || 'Video mới',
                  description: formData.description || '',
                  youtubeId: formData.youtubeId || 'dQw4w9WgXcQ',
                  category: formData.category || 'Khác',
              };

              if (isEditing) {
                  const res = await libraryService.updateVideo(editingItem._id, videoData);
                  setVideos(prev => prev.map(v => v._id === editingItem._id ? res.data : v));
              } else {
                  const newVideo: Partial<Video> = {
                      ...videoData,
                      uploadedBy: user._id,
                      uploadDate: new Date().toISOString(),
                      viewCount: 0,
                  };
                  const res = await libraryService.createVideo(newVideo);
                  setVideos(prev => [res.data, ...prev]);
              }
          }

          setIsSaving(false);
          setIsModalOpen(false);
          setEditingItem(null);
          setEditingType(null);
          setFormData({});
          success('Lưu tài liệu thành công');
      } catch (err: any) {
          console.error('Save error:', err);
          showError(err.response?.data?.message || 'Lỗi lưu tài liệu');
          setIsSaving(false);
      }
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Thư viện</h1>
            <p className="text-gray-500 text-sm">Kho lưu trữ tài liệu, âm nhạc và video</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setIsTypeModalOpen(true)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-200"
            >
                <Icons.Settings className="w-4 h-4 mr-2" />
                Quản lý loại
            </button>
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
          {libraryTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center group ${
                  activeTabId === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                 <tab.icon className="w-4 h-4 mr-2" />
                 {tab.label}
                 {activeTabId === tab.id && !INITIAL_TABS.some(t => t.id === tab.id) && (
                     <Icons.X 
                        className="ml-2 w-3 h-3 text-red-400 hover:text-red-600" 
                        onClick={(e) => { e.stopPropagation(); handleRemoveType(tab.id); }}
                    />
                 )}
              </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        
        {/* BOOKS VIEW */}
        {activeType === 'book' && (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {books.filter(b => b.categories.includes(activeTabInfo.label) && b.title.toLowerCase().includes(searchTerm.toLowerCase())).map(book => (
                    <div key={book._id} className="group relative bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all overflow-hidden flex flex-col">
                        <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center relative overflow-hidden">
                            {book.coverImageUrl ? (
                                <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                                book.fileType === 'pdf' ? (
                                    <Icons.FileText className="w-12 h-12 text-red-400" />
                                ) : (
                                    <Icons.File className="w-12 h-12 text-blue-400" />
                                )
                            )}
                            
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button 
                                    onClick={() => handleEdit(book, 'book')}
                                    className="bg-white/90 text-blue-600 p-1.5 rounded-full hover:bg-blue-50 shadow-sm"
                                >
                                    <Icons.Edit className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDeleteClick(book._id, 'book', book.title)}
                                    className="bg-white/90 text-red-600 p-1.5 rounded-full hover:bg-red-50 shadow-sm"
                                >
                                    <Icons.Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-4 flex flex-col flex-1">
                            <h4 className="font-semibold text-gray-800 text-sm truncate mb-1" title={book.title}>{book.title}</h4>
                            <div className="mt-auto">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                    <span>{book.downloadCount} tải</span>
                                    <span>{new Date(book.uploadDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {book.categories.map(c => (
                                        <span key={c} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{c}</span>
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
        {activeType === 'music' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <ul className="divide-y divide-gray-100">
                    {songs.filter(s => s.category === activeTabInfo.label && s.title.toLowerCase().includes(searchTerm.toLowerCase())).map((song, idx) => (
                        <li key={song._id} className="p-4 flex items-center hover:bg-gray-50 transition-colors group">
                            <span className="text-gray-400 w-8 text-center text-sm font-medium">{idx + 1}</span>
                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden shrink-0 mx-4">
                                <img src={song.coverImageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{song.title}</p>
                                <p className="text-xs text-gray-500">{song.category}</p>
                            </div>
                            <div className="text-xs text-gray-400 mx-4">
                                {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleEdit(song, 'music')}
                                    className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Icons.Edit className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDeleteClick(song._id, 'music', song.title)}
                                    className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Icons.Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </li>
                    ))}
                    {songs.length === 0 && (
                        <li className="p-8 text-center text-gray-500">Chưa có bài hát nào.</li>
                    )}
                </ul>
            </div>
        )}

        {/* VIDEO VIEW */}
        {activeType === 'video' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.filter(v => v.category === activeTabInfo.label && v.title.toLowerCase().includes(searchTerm.toLowerCase())).map(video => (
                    <div key={video._id} className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all">
                        <div className="relative aspect-video bg-gray-100">
                             <img 
                                src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`} 
                                alt={video.title}
                                className="w-full h-full object-cover"
                             />
                             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button 
                                    onClick={() => handleEdit(video, 'video')}
                                    className="bg-black/50 text-white p-1.5 rounded-full hover:bg-blue-600 backdrop-blur-sm"
                                >
                                    <Icons.Edit className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDeleteClick(video._id, 'video', video.title)}
                                    className="bg-black/50 text-white p-1.5 rounded-full hover:bg-red-600 backdrop-blur-sm"
                                >
                                    <Icons.Trash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-gray-900 line-clamp-2 text-sm mb-1" title={video.title}>{video.title}</h4>
                            <p className="text-xs text-gray-500 mb-2">{video.category}</p>
                            <div className="flex items-center text-xs text-gray-400">
                                <Icons.Users className="w-3 h-3 mr-1" /> {video.viewCount} views
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

       {/* --- ADD RESOURCE MODAL --- */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] relative flex flex-col animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        {activeType === 'book' && <Icons.BookOpen className="w-5 h-5 mr-2 text-blue-600" />}
                        {activeType === 'music' && <Icons.Music className="w-5 h-5 mr-2 text-pink-600" />}
                        {activeType === 'video' && <Icons.Youtube className="w-5 h-5 mr-2 text-red-600" />}
                        
                        {editingItem ? 'Sửa ' : 'Thêm '}
                        {activeType === 'book' ? 'Tài liệu' : activeType === 'music' ? 'Bài hát' : 'Video'}
                    </h3>
                    <button onClick={() => {
                        setIsModalOpen(false);
                        setEditingItem(null);
                        setEditingType(null);
                        setFormData({});
                    }}><Icons.X className="w-5 h-5 text-gray-400 hover:text-red-500" /></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <form id="create-resource-form" onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                            <input 
                                required
                                name="title"
                                type="text" 
                                value={formData.title || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder={activeType === 'video' ? 'Tiêu đề video...' : 'Nhập tiêu đề...'}
                            />
                        </div>

                        {/* Category Selection based on Dynamic Tabs */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại thư viện (Danh mục)</label>
                            <select 
                                name="category"
                                value={formData.category || activeTabInfo.label}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                {libraryTabs.filter(t => t.type === activeType).map(tab => (
                                    <option key={tab.id} value={tab.label}>{tab.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Type Specific Fields */}
                        {activeType === 'video' ? (
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video ID</label>
                                <input 
                                    required
                                    name="youtubeId"
                                    type="text" 
                                    value={formData.youtubeId || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="VD: dQw4w9WgXcQ"
                                />
                                <p className="text-xs text-gray-500 mt-1">Nhập ID video từ đường dẫn YouTube (sau v=)</p>
                             </div>
                        ) : activeType === 'book' ? (
                             <>
                                <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh bìa</label>
                                     <div 
                                        onClick={handleTriggerFileUpload}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors relative overflow-hidden h-32 bg-gray-50"
                                     >
                                         {formData.coverImageUrl ? (
                                             <img src={formData.coverImageUrl} className="w-full h-full object-cover absolute inset-0 rounded-lg" alt="Preview" />
                                         ) : (
                                             <>
                                                <Icons.Image className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-500">Tải ảnh bìa</span>
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
                                
                                <div
                                    onClick={handleUploadAreaClick}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer mt-4"
                                >
                                     <Icons.Upload className="w-10 h-10 text-gray-400 mb-2" />
                                     <p className="text-sm text-gray-600">Kéo thả file nội dung vào đây hoặc click để chọn</p>
                                     <p className="text-xs text-gray-400 mt-1">PDF, DOCX</p>
                                     {formData.contentFileName && (
                                         <p className="text-xs text-gray-600 mt-2">Đã chọn: {formData.contentFileName}</p>
                                     )}
                                     <input
                                         type="file"
                                         ref={contentFileRef}
                                         className="hidden"
                                         accept=".pdf,.docx"
                                         onChange={handleContentFileChange}
                                     />
                                </div>
                             </>
                        ) : activeType === 'music' ? (
                             <>
                                <div
                                    onClick={handleUploadAreaClick}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                     <Icons.Music className="w-10 h-10 text-pink-400 mb-2" />
                                     <p className="text-sm text-gray-600">Tải file nhạc (MP3, WAV)</p>
                                     <p className="text-xs text-gray-400 mt-1">Kéo thả hoặc click để chọn</p>
                                     {formData.contentFileName && (
                                         <p className="text-xs text-green-600 mt-2 font-medium">✓ {formData.contentFileName}</p>
                                     )}
                                     <input
                                         type="file"
                                         ref={contentFileRef}
                                         className="hidden"
                                         accept="audio/*"
                                         onChange={handleContentFileChange}
                                     />
                                </div>

                                <div className="mt-4">
                                     <label className="block text-sm font-medium text-gray-700 mb-2">File lời bài hát (tùy chọn)</label>
                                     <div
                                         onClick={() => document.getElementById('lyrics-file-input')?.click()}
                                         className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer"
                                     >
                                          <Icons.FileText className="w-8 h-8 text-gray-400 mb-2" />
                                          <p className="text-sm text-gray-600">Tải file lời bài hát (PDF/DOCX)</p>
                                          {formData.lyricsFileName && (
                                              <p className="text-xs text-green-600 mt-2 font-medium">✓ {formData.lyricsFileName}</p>
                                          )}
                                          <input
                                              id="lyrics-file-input"
                                              type="file"
                                              className="hidden"
                                              accept=".pdf,.docx"
                                              onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                      setFormData((prev: any) => ({ 
                                                          ...prev, 
                                                          lyricsFileName: file.name, 
                                                          lyricsFile: file 
                                                      }));
                                                  }
                                              }}
                                          />
                                     </div>
                                </div>
                             </>
                        ) : null}

                        {/* Description for Books and Videos */}
                        {(activeType === 'book' || activeType === 'video') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                                <textarea 
                                    name="description"
                                    rows={3}
                                    value={formData.description || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                ></textarea>
                            </div>
                        )}
                    </form>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl flex-shrink-0">
                    <button 
                        onClick={() => {
                            setIsModalOpen(false);
                            setEditingItem(null);
                            setEditingType(null);
                            setFormData({});
                        }}
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
                        {isSaving ? 'Đang lưu...' : editingItem ? 'Cập nhật' : 'Lưu lại'}
                    </button>
                </div>
             </div>
        </div>
      )}

      {/* --- MANAGE CATEGORY MODAL --- */}
      {isTypeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsTypeModalOpen(false)}></div>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative flex flex-col animate-in zoom-in-95">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Quản lý loại thư viện số</h3>
                    <Icons.X className="w-5 h-5 text-gray-400 cursor-pointer" onClick={() => setIsTypeModalOpen(false)} />
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tên loại mới</label>
                            <input 
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newTypeName}
                                onChange={(e) => setNewTypeName(e.target.value)}
                                placeholder="VD: Thuyết đạo, Tập san..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Định dạng hiển thị</label>
                            <select 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                                value={newTypeCategory}
                                onChange={(e) => setNewTypeCategory(e.target.value as any)}
                            >
                                <option value="book">Tài liệu (Sách/PDF)</option>
                                <option value="music">Âm thanh (Nhạc/Audio)</option>
                                <option value="video">Video (YouTube)</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleAddType}
                            className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Thêm loại mới
                        </button>
                    </div>

                    <div className="mt-8">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Các loại hiện có</h4>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {libraryTabs.map(tab => (
                                <div key={tab.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                                    <span className="text-sm font-medium text-gray-700 flex items-center">
                                        <tab.icon className="w-3 h-3 mr-2 text-gray-400" />
                                        {tab.label}
                                    </span>
                                    {!INITIAL_TABS.some(t => t.id === tab.id) && (
                                        <button onClick={() => handleRemoveType(tab.id)} className="text-red-400 hover:text-red-600">
                                            <Icons.Trash className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
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
                      {deleteConfirm.type === 'category' 
                          ? `Bạn có chắc muốn xóa loại "${deleteConfirm.name}"?`
                          : `Bạn có chắc muốn xóa "${deleteConfirm.name}"?`
                      }
                  </p>
                  {deleteConfirm.type === 'category' && (
                      <p className="text-gray-500 text-sm mb-4">
                          Các tài liệu cũ vẫn sẽ tồn tại nhưng không hiển thị trong tab này.
                      </p>
                  )}
                  {deleteConfirm.type === 'item' && (
                      <p className="text-gray-500 text-sm mb-4">
                          Hành động này không thể hoàn tác.
                      </p>
                  )}
                  <div className="flex justify-end gap-3">
                      <button
                          onClick={() => setDeleteConfirm({ open: false, id: '', type: 'item', name: '', itemType: '' })}
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
