import React from "react";

// --- ENUMS ---
export enum Gender {
  MALE = "Nam",
  FEMALE = "Nữ",
  OTHER = "Khác",
}

export enum UserRole {
  MEMBER = "Thành Viên",
  ADMIN = "Admin",
  MANAGER = "Trưởng Ban",
}

export enum UserStatus {
  ACTIVE = "Đang hoạt động",
  INACTIVE = "Ngừng hoạt động",
  ON_LEAVE = "Tạm Nghỉ",
}

export enum EventStatus {
  UPCOMING = "Sắp diễn ra",
  ONGOING = "Đang diễn ra",
  COMPLETED = "Đã kết thúc",
  CANCELLED = "Đã hủy",
}

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}

// --- DATABASE ENTITIES ---

export interface Temple {
  _id: string;
  name: string;
  address: string;
  establishedDate: string; // ISO Date
  description?: string;
  imageUrl?: string;
}

export interface TempleHistoryEntry {
  templeId: string;
  startDate: string;
  endDate?: string;
  role?: string;
}

export interface Department {
  _id: string;
  name: string;
  description?: string;
  managerId?: string; // Ref to Personal
}

export interface Personal {
  _id: string;
  fullname: string;
  email?: string;
  phoneNumber?: string; // Ref to User
  gender: Gender;
  dateOfBirth?: string;
  address?: string;
  departmentId?: string; // Ref to Department
  position?: string;
  joinDate?: string;
  status: UserStatus;
  avatarUrl?: string;
  note?: string;
  currentTempleId?: string; // Ref to Temple
  templeHistory?: TempleHistoryEntry[];
}

export interface User {
  _id: string;
  phoneNumber: string;
  role: UserRole;
  personalId: string; // Ref to Personal
  lastLogin?: string;
  createdAt: string;
}

export interface Event {
  _id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  location: string;
  bannerUrl?: string;
  eventType: string; // "Lễ lớn", "Hoạt động thanh niên"
  organizerId?: string; // Ref to Personal
  status: EventStatus;
  participantsCount: number; // Virtual field for UI
}

export interface Book {
  _id: string;
  title: string;
  description?: string;
  categories: string[];
  uploadedBy: string; // Ref User
  uploadDate: string;
  fileUrl: string;
  coverImageUrl?: string; // Added cover image
  fileType: "pdf" | "docx";
  downloadCount: number;
  viewCount: number;
}

export interface Song {
  _id: string;
  title: string;
  audioUrl: string;
  coverImageUrl?: string;
  uploadedBy: string; // Ref User
  uploadDate: string;
  category: string;
  duration: number; // seconds
  playCount: number;
}

export interface Video {
  _id: string;
  title: string;
  description?: string;
  youtubeId: string; // ID of youtube video
  thumbnailUrl?: string;
  uploadedBy: string; // Ref User
  uploadDate: string;
  category: string;
  viewCount: number;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  type: "event" | "system" | "chat" | "family" | "media" | "other";
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  userId: string;
  status: "Đang diễn ra" | "Kết thúc";
  lastMessage?: string;
  updatedAt: string;
}

export interface ActivityLog {
  _id: string;
  userId: string; // Ref User name for UI
  action: string;
  targetCollection: string;
  targetId: string;
  timestamp: string;
  ip: string;
}

// --- UI HELPERS ---
export interface NavItem {
  label: string;
  icon?: React.ReactNode;
  href: string;
  active?: boolean;
}
