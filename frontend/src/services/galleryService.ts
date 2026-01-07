import api from "@/util/axios";

export interface GalleryAlbum {
  _id: string;
  title: string;
  coverImage: string;
  date?: string;
  location?: string;
  description?: string;
  eventId?: string;
  isEvent: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaFile {
  _id: string;
  albumId: string;
  fileUrl: string;
  caption?: string;
  fileType: "image" | "video";
  thumbnailUrl?: string;
  altText?: string;
  uploadedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const galleryService = {
  // Albums
  getAllAlbums: () => api.get<{ success: boolean; data: GalleryAlbum[] }>("/gallery/albums"),
  
  getAlbumById: (id: string) => api.get<{ success: boolean; data: GalleryAlbum }>(`/gallery/albums/${id}`),
  
  createAlbum: (data: Partial<GalleryAlbum>) =>
    api.post<{ success: boolean; data: GalleryAlbum }>("/gallery/albums", data),
  
  updateAlbum: (id: string, data: Partial<GalleryAlbum>) =>
    api.put<{ success: boolean; data: GalleryAlbum }>(`/gallery/albums/${id}`, data),
  
  deleteAlbum: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/gallery/albums/${id}`),

  // Media
  getMediaByAlbum: (albumId: string) =>
    api.get<{ success: boolean; data: MediaFile[]; count: number }>(`/gallery/albums/${albumId}/media`),
  
  getAllMedia: () =>
    api.get<{ success: boolean; data: MediaFile[] }>("/gallery/media"),
  
  uploadMedia: (albumId: string, data: { fileUrl: string; caption?: string; fileType?: string; thumbnailUrl?: string; altText?: string }) =>
    api.post<{ success: boolean; data: MediaFile }>(`/gallery/albums/${albumId}/media`, data),
  
  bulkUploadMedia: (albumId: string, files: Array<{ fileUrl: string; caption?: string; fileType?: string; thumbnailUrl?: string; altText?: string }>) =>
    api.post<{ success: boolean; data: MediaFile[]; count: number }>(`/gallery/albums/${albumId}/media/bulk`, { albumId, files }),
  
  updateMedia: (id: string, data: { caption?: string; altText?: string }) =>
    api.put<{ success: boolean; data: MediaFile }>(`/gallery/media/${id}`, data),
  
  deleteMedia: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/gallery/media/${id}`),
};
