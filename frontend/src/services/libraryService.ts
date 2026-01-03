import api from '@/util/axios';
import type { Book, Song, Video } from '@/types';

export const libraryService = {
  // Books
  getBooks: () => api.get<Book[]>('/books'),
  getBook: (id: string) => api.get<Book>(`/books/${id}`),
  createBook: (data: Partial<Book>) => api.post('/books', data),
  updateBook: (id: string, data: Partial<Book>) => api.put(`/books/${id}`, data),
  deleteBook: (id: string) => api.delete(`/books/${id}`),

  // Songs
  getSongs: () => api.get<Song[]>('/songs'),
  getSong: (id: string) => api.get<Song>(`/songs/${id}`),
  createSong: (data: Partial<Song>) => api.post('/songs', data),
  updateSong: (id: string, data: Partial<Song>) => api.put(`/songs/${id}`, data),
  deleteSong: (id: string) => api.delete(`/songs/${id}`),

  // Videos
  getVideos: () => api.get<Video[]>('/videos'),
  getVideo: (id: string) => api.get<Video>(`/videos/${id}`),
  createVideo: (data: Partial<Video>) => api.post('/videos', data),
  updateVideo: (id: string, data: Partial<Video>) => api.put(`/videos/${id}`, data),
  deleteVideo: (id: string) => api.delete(`/videos/${id}`),

  // File uploads
  uploadImage: (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/upload', fd);
  },
  uploadContent: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/upload/content', fd);
  },
};
