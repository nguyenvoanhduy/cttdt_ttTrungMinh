import React, { useState } from 'react';
import * as Icons from '@/components/Icons';
import { MOCK_BOOKS, MOCK_SONGS } from '@/constants';

export const Library = () => {
  const [activeTab, setActiveTab] = useState<'books' | 'songs'>('books');

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Thư viện số</h1>
        <p className="text-gray-500 text-sm">Kho lưu trữ tài liệu giáo lý và âm nhạc</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('books')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'books'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center">
                <Icons.BookOpen className="w-4 h-4 mr-2" />
                Sách & Giáo Lý
            </span>
          </button>
          <button
            onClick={() => setActiveTab('songs')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'songs'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
             <span className="flex items-center">
                <Icons.Music className="w-4 h-4 mr-2" />
                Âm Nhạc (Songs)
            </span>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'books' ? (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {MOCK_BOOKS.map(book => (
                    <div key={book._id} className="group relative bg-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer">
                        <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                            {book.fileType === 'pdf' ? (
                                <Icons.FileText className="w-12 h-12 text-red-400" />
                            ) : (
                                <Icons.File className="w-12 h-12 text-blue-400" />
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="bg-white text-gray-900 rounded-full p-2">
                                    <Icons.Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <h4 className="font-semibold text-gray-800 text-sm truncate">{book.title}</h4>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                             <span>{book.downloadCount} tải</span>
                             <span>{new Date(book.uploadDate).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {book.categories.map(c => (
                                <span key={c} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{c}</span>
                            ))}
                        </div>
                    </div>
                ))}
                {/* Upload placeholder */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-4 text-gray-400 hover:border-primary-500 hover:text-primary-500 cursor-pointer transition-colors aspect-[3/4]">
                    <Icons.Upload className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Tải lên</span>
                </div>
             </div>
        ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <ul className="divide-y divide-gray-100">
                    {MOCK_SONGS.map((song, idx) => (
                        <li key={song._id} className="p-4 flex items-center hover:bg-gray-50 transition-colors">
                            <span className="text-gray-400 w-8 text-center text-sm font-medium">{idx + 1}</span>
                            <div className="h-10 w-10 rounded-md bg-gray-200 overflow-hidden flex-shrink-0 mx-4">
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
                                <button className="p-2 text-gray-400 hover:text-primary-600 rounded-full hover:bg-primary-50">
                                    <Icons.Play className="w-4 h-4" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
};
