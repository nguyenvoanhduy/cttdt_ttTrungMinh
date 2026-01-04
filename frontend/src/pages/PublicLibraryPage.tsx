/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useRef, useEffect } from 'react';
import * as Icons from '../components/Icons';
import { libraryService } from '../services/libraryService';
import type { Book, Song, Video } from '../types';

export const PublicLibraryPage = () => {
  // Define Tabs Configuration - Split Doctrine and Music
  const LIBRARY_TABS = [
    { id: 'thanh_giao', label: 'Thánh Giáo', icon: Icons.BookOpen, type: 'book' },
    { id: 'su_dao', label: 'Sử Đạo', icon: Icons.FileClock, type: 'book' },
    { id: 'sach_tap_san', label: 'Sách & tập san', icon: Icons.Library, type: 'book' },
    { id: 'giao_ly', label: 'Giáo lý', icon: Icons.Book, type: 'book' },
    { id: 'nhac_dao', label: 'Nhạc đạo', icon: Icons.Music, type: 'music' },
    { id: 'video', label: 'Video từ youtube', icon: Icons.Youtube, type: 'video' },
  ];

  const [activeTabId, setActiveTabId] = useState('thanh_giao');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingBook, setViewingBook] = useState<Book | null>(null);
  const [playingSong, setPlayingSong] = useState<Song | null>(null);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Data states
  const [books, setBooks] = useState<Book[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current active tab type to determine layout
  const activeTabType = LIBRARY_TABS.find(t => t.id === activeTabId)?.type || 'book';

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [booksRes, songsRes, videosRes] = await Promise.all([
          libraryService.getBooks(),
          libraryService.getSongs(),
          libraryService.getVideos(),
        ]);
        setBooks(booksRes.data || []);
        setSongs(songsRes.data || []);
        setVideos(videosRes.data || []);
      } catch (err) {
        console.error('Failed to fetch library data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Audio player effects
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playingSong) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', updateProgress);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', updateProgress);
    };
  }, [playingSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(err => {
        console.error('Play error:', err);
        console.error('Audio source:', audio.src);
        setIsPlaying(false);
        alert('Không thể phát bài hát. Vui lòng kiểm tra kết nối hoặc thử lại sau.');
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const handlePlaySong = (song: Song) => {
      if (playingSong?._id === song._id) {
        setIsPlaying(!isPlaying);
      } else {
        // Validate audio URL before setting
        const audioUrl = getFullFileUrl(song.audioUrl);
        console.log('Loading audio from:', audioUrl); // Debug log
        
        if (!audioUrl || audioUrl === '') {
          console.error('Invalid audio URL for song:', song.title);
          alert('Không thể phát bài hát này. URL không hợp lệ.');
          return;
        }
        
        setPlayingSong(song);
        setIsPlaying(true);
        setProgress(0);
        setCurrentTime(0);
      }
  };

  const handleCloseViewer = () => {
      setViewingBook(null);
      setPlayingVideo(null);
      
      // Stop audio when closing music player
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingSong(null);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
  };

  // Helper function to format time in mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to get full file URL
  const getFullFileUrl = (fileUrl: string) => {
    if (!fileUrl) return '';
    
    // If already a full URL (starts with http:// or https://)
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    
    // If relative path, prepend backend base URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const baseURL = apiUrl.replace('/api', '');
    
    // Ensure proper path construction
    const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    return `${baseURL}${path}`;
  };

  // Map tab IDs to category names
  const getCategoryForTab = (tabId: string): string => {
    const categoryMap: Record<string, string> = {
      'thanh_giao': 'Thánh Giáo',
      'su_dao': 'Sử Đạo',
      'sach_tap_san': 'Sách & tập san',
      'giao_ly': 'Giáo lý',
    };
    return categoryMap[tabId] || '';
  };

  // Filter Data based on Active Tab and Search Term
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // If it's a book tab, also filter by category
    if (activeTabType === 'book') {
      const categoryForTab = getCategoryForTab(activeTabId);
      const matchesCategory = categoryForTab ? b.categories.includes(categoryForTab) : true;
      return matchesSearch && matchesCategory;
    }
    
    return matchesSearch;
  });

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in duration-500">
        {/* Banner */}
       <div className="bg-blue-900 py-16 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h1 className="font-serif text-4xl font-bold mb-4">Thư Viện Số</h1>
          <p className="text-blue-200 text-lg">Kho tàng tài liệu giáo lý và âm nhạc Đạo</p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 py-12">
        
        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons.Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-shadow"
                placeholder="Tìm kiếm sách, bài hát, video..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-12">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 border-b border-gray-200 px-4">
                 {LIBRARY_TABS.map(tab => (
                     <button 
                        key={tab.id}
                        onClick={() => setActiveTabId(tab.id)}
                        className={`pb-4 px-3 text-base md:text-lg font-medium border-b-2 transition-colors flex items-center gap-2 ${
                            activeTabId === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                     >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                     </button>
                 ))}
            </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : activeTabType === 'book' && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-in slide-in-from-bottom-2 fade-in">
                {filteredBooks.length > 0 ? filteredBooks.map(book => (
                    <div 
                        key={book._id} 
                        onClick={() => setViewingBook(book)}
                        className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 transition-all cursor-pointer top-0 hover:-top-1 overflow-hidden flex flex-col"
                    >
                        <div className="aspect-[3/4] bg-gray-50 flex items-center justify-center relative overflow-hidden">
                             {book.coverImageUrl ? (
                                <img 
                                    src={book.coverImageUrl} 
                                    alt={book.title} 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                             ) : (
                                <div className="text-center p-2">
                                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mb-2">
                                        <Icons.FileText className="w-8 h-8" />
                                    </div>
                                    <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">{book.fileType}</span>
                                </div>
                             )}

                             <div className="absolute inset-0 bg-blue-900/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-10">
                                <button className="bg-white text-blue-900 font-bold px-4 py-2 rounded-full flex items-center text-sm hover:bg-amber-400 transition-colors">
                                    <Icons.BookOpen className="w-4 h-4 mr-2" /> Đọc ngay
                                </button>
                             </div>
                        </div>
                        
                        <div className="p-4 flex flex-col flex-1">
                            <h4 className="font-bold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{book.title}</h4>
                            <div className="mt-auto">
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {book.categories.map(c => (
                                        <span key={c} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] uppercase font-bold tracking-wide">{c}</span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-400">
                                     <div className="flex items-center">
                                        <Icons.Download className="w-3 h-3 mr-1" /> {book.downloadCount}
                                     </div>
                                     <div className="flex items-center">
                                        <Icons.Users className="w-3 h-3 mr-1" /> {book.viewCount}
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Không tìm thấy tài liệu nào phù hợp.
                    </div>
                )}
            </div>
        )}

        {!loading && activeTabType === 'music' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 fade-in">
                {filteredSongs.length > 0 ? filteredSongs.map((song, idx) => (
                    <div 
                        key={song._id} 
                        onClick={() => handlePlaySong(song)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow group cursor-pointer"
                    >
                        <div className="relative w-20 h-20 shrink-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full p-[3px]">
                            <img src={song.coverImageUrl} alt={song.title} className="w-full h-full object-cover rounded-full shadow-sm" />
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icons.Play className="w-8 h-8 text-white fill-current" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">{song.title}</h4>
                            <p className="text-sm text-gray-500 mb-2">{song.category}</p>
                            <div className="w-full bg-gray-100 rounded-full h-1 mb-2 overflow-hidden">
                                <div className="bg-blue-500 h-1 rounded-full" style={{width: '0%'}}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono">
                                <span>00:00</span>
                                <span>{Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}</span>
                            </div>
                        </div>
                        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
                            <Icons.Play className="w-4 h-4" />
                        </button>
                    </div>
                )) : (
                     <div className="col-span-full text-center py-12 text-gray-500">
                        Không tìm thấy bài hát nào phù hợp.
                    </div>
                )}
            </div>
        )}

        {!loading && activeTabType === 'video' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2 fade-in">
                 {filteredVideos.length > 0 ? filteredVideos.map(video => (
                     <div 
                        key={video._id}
                        onClick={() => setPlayingVideo(video)}
                        className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer transition-all hover:-translate-y-1"
                     >
                        <div className="relative aspect-video bg-black">
                            <img 
                                src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`} 
                                alt={video.title}
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Icons.Play className="w-6 h-6 text-white fill-current ml-1" />
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                {video.category}
                            </div>
                        </div>
                        <div className="p-5">
                            <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                                {video.title}
                            </h4>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                {video.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                                <div className="flex items-center">
                                    <Icons.Users className="w-3 h-3 mr-1" /> {video.viewCount} lượt xem
                                </div>
                                <div>{new Date(video.uploadDate).toLocaleDateString('vi-VN')}</div>
                            </div>
                        </div>
                     </div>
                 )) : (
                     <div className="col-span-full text-center py-12 text-gray-500">
                        Không tìm thấy video nào phù hợp.
                    </div>
                )}
             </div>
        )}
      </div>

      {/* --- MEDIA VIEWER MODALS --- */}

      {/* BOOK VIEWER */}
      {viewingBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                  {/* Toolbar */}
                  <div className="h-16 bg-gray-900 text-white flex items-center justify-between px-6 shrink-0">
                      <div className="flex items-center gap-3">
                          <Icons.FileText className="w-5 h-5 text-blue-400" />
                          <div>
                              <h3 className="font-bold text-sm">{viewingBook.title}</h3>
                              <p className="text-xs text-gray-400">Trang 1 / 15</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <a 
                            href={getFullFileUrl(viewingBook.fileUrl)}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-700 rounded-full"
                          >
                            <Icons.Download className="w-5 h-5" />
                          </a>
                          <div className="w-px h-6 bg-gray-700"></div>
                          <button onClick={handleCloseViewer} className="p-2 hover:bg-red-600 rounded-full transition-colors"><Icons.X className="w-5 h-5" /></button>
                      </div>
                  </div>
                  
                  {/* Content Area */}
                  <div className="flex-1 bg-gray-100 overflow-hidden flex flex-col">
                      {viewingBook.fileType === 'pdf' && viewingBook.fileUrl ? (
                          /* PDF Viewer with iframe */
                          <iframe
                              src={getFullFileUrl(viewingBook.fileUrl)}
                              className="w-full h-full border-0"
                              title={viewingBook.title}
                          />
                      ) : viewingBook.fileUrl ? (
                          /* For DOCX or other formats, show download option */
                          <div className="flex-1 flex items-center justify-center p-8">
                              <div className="text-center max-w-md">
                                  <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 mb-4">
                                      <Icons.FileText className="w-10 h-10" />
                                  </div>
                                  <h3 className="text-xl font-bold text-gray-900 mb-2">{viewingBook.title}</h3>
                                  <p className="text-gray-600 mb-6">
                                      Tài liệu định dạng {viewingBook.fileType.toUpperCase()}. Vui lòng tải xuống để xem nội dung đầy đủ.
                                  </p>
                                  <a
                                      href={getFullFileUrl(viewingBook.fileUrl)}
                                      download
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                      <Icons.Download className="w-5 h-5 mr-2" />
                                      Tải xuống tài liệu
                                  </a>
                              </div>
                          </div>
                      ) : (
                          /* Fallback if no fileUrl */
                          <div className="flex-1 bg-gray-100 overflow-y-auto p-8 flex justify-center">
                              <div className="bg-white shadow-xl w-full max-w-3xl min-h-full p-12 text-gray-800">
                                  <h1 className="text-3xl font-serif font-bold text-center mb-8">{viewingBook.title}</h1>
                                  
                                  {viewingBook.coverImageUrl && (
                                      <div className="flex justify-center mb-8">
                                          <img src={viewingBook.coverImageUrl} alt="Cover" className="max-w-[200px] shadow-lg" />
                                      </div>
                                  )}

                                  <div className="space-y-4 text-justify leading-relaxed font-serif">
                                      <p className="text-gray-400 italic text-center py-12">
                                          [Nội dung tài liệu chưa được tải lên hoặc không khả dụng]
                                      </p>
                                      <p className="text-center text-sm text-gray-500">
                                          Vui lòng liên hệ Ban Quản Trị để được hỗ trợ.
                                      </p>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* MUSIC PLAYER */}
      {playingSong && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
               {/* Hidden Audio Element */}
               <audio 
                 ref={audioRef} 
                 src={getFullFileUrl(playingSong.audioUrl)}
                 preload="metadata"
                 onError={(e) => {
                   console.error('Audio load error:', e);
                   console.error('Failed to load:', getFullFileUrl(playingSong.audioUrl));
                   alert('Không thể tải file nhạc. Vui lòng kiểm tra đường dẫn file.');
                   setIsPlaying(false);
                 }}
                 onLoadedData={() => console.log('Audio loaded successfully')}
               />
               
               <button onClick={handleCloseViewer} className="absolute top-6 right-6 text-white/50 hover:text-white p-2 z-50">
                   <Icons.X className="w-8 h-8" />
               </button>

               <div className="flex flex-col md:flex-row items-center gap-12 max-w-4xl w-full">
                    {/* Cover Art */}
                    <div className="w-64 h-64 md:w-96 md:h-96 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-gradient-to-br from-blue-400 to-blue-600 p-2 animate-pulse">
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                            <img src={playingSong.coverImageUrl} alt="" className="w-full h-full object-cover animate-in zoom-in duration-500" />
                            {/* Vinyl effect shine */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 w-full text-center md:text-left text-white">
                         <h2 className="text-3xl md:text-4xl font-bold mb-2">{playingSong.title}</h2>
                         <p className="text-blue-300 text-lg mb-8">{playingSong.category}</p>

                         {/* Progress Bar */}
                         <div className="mb-8 group">
                             <div 
                               className="h-2 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
                               onClick={(e) => {
                                 const audio = audioRef.current;
                                 if (!audio) return;
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 const x = e.clientX - rect.left;
                                 const percent = x / rect.width;
                                 audio.currentTime = percent * audio.duration;
                               }}
                             >
                                 <div className="h-full bg-blue-500 relative" style={{ width: `${progress}%` }}>
                                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100"></div>
                                 </div>
                             </div>
                             <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono">
                                 <span>{formatTime(currentTime)}</span>
                                 <span>{formatTime(duration)}</span>
                             </div>
                         </div>

                         {/* Buttons */}
                         <div className="flex items-center justify-center md:justify-start gap-8 mb-6">
                             <button className="text-gray-400 hover:text-white transition-colors"><Icons.Shuffle className="w-6 h-6" /></button>
                             <button className="text-gray-200 hover:text-white transition-colors"><Icons.SkipBack className="w-8 h-8 fill-current" /></button>
                             
                             <button 
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-white/20"
                             >
                                 {isPlaying ? <Icons.Pause className="w-6 h-6 fill-current" /> : <Icons.Play className="w-6 h-6 fill-current ml-1" />}
                             </button>
                             
                             <button className="text-gray-200 hover:text-white transition-colors"><Icons.SkipForward className="w-8 h-8 fill-current" /></button>
                             <button className="text-gray-400 hover:text-white transition-colors"><Icons.Repeat className="w-6 h-6" /></button>
                         </div>

                         {/* Lyrics Download Button */}
                         {playingSong.lyricsUrl && (
                           <div className="mt-4 pt-4 border-t border-gray-700">
                             <a
                               href={getFullFileUrl(playingSong.lyricsUrl)}
                               download
                               target="_blank"
                               rel="noopener noreferrer"
                               className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                             >
                               <Icons.FileText className="w-4 h-4 mr-2" />
                               Tải lời bài hát
                             </a>
                           </div>
                         )}
                    </div>
               </div>
           </div>
      )}

      {/* VIDEO PLAYER MODAL */}
      {playingVideo && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
               <div className="w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                   <div className="relative aspect-video w-full">
                       <iframe 
                           width="100%" 
                           height="100%" 
                           src={`https://www.youtube.com/embed/${playingVideo.youtubeId}?autoplay=1`} 
                           title={playingVideo.title} 
                           frameBorder="0" 
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                           allowFullScreen
                       ></iframe>
                       <button 
                            onClick={handleCloseViewer}
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
                        >
                            <Icons.X className="w-8 h-8" />
                        </button>
                   </div>
                   <div className="p-6 bg-gray-900 text-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold mb-2">{playingVideo.title}</h2>
                                <p className="text-gray-400 text-sm line-clamp-2">{playingVideo.description}</p>
                            </div>
                            <button onClick={handleCloseViewer} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                                <Icons.X className="w-5 h-5" />
                            </button>
                        </div>
                   </div>
               </div>
           </div>
      )}
    </div>
  );
};
