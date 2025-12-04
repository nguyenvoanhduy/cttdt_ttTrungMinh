import type { 
  Personal, User, Temple, Department, Event, Book, Song, Video, Notification, 
  ActivityLog,  
} from './types';
import {
  Gender, UserStatus, UserRole, EventStatus
} from './types'
// 1. TEMPLES
export const MOCK_TEMPLES: Temple[] = [
  { _id: 't1', name: 'Thánh Thất Trung Minh', address: 'Bến Tre', establishedDate: '1954-01-01', description: 'Thánh thất trung ương của khu vực.' },
  { _id: 't2', name: 'Điện Thờ Phật Mẫu', address: 'TP.HCM', establishedDate: '1960-05-15', description: 'Nơi thờ phượng Đức Phật Mẫu.' },
];

// 2. DEPARTMENTS
export const MOCK_DEPARTMENTS: Department[] = [
  { _id: 'd1', name: 'Ban Cai Quản', description: 'Điều hành chung', managerId: 'p1' },
  { _id: 'd2', name: 'Ban Nghi Lễ', description: 'Phụ trách cúng tế', managerId: 'p3' },
  { _id: 'd3', name: 'Ban Phước Thiện', description: 'Công tác xã hội', managerId: 'p2' },
];

// 3. PERSONALS
export const MOCK_PERSONALS: Personal[] = [
  { 
    _id: 'p1', fullname: 'Giáo Hữu Ngọc Minh', gender: Gender.MALE, dateOfBirth: '1965-02-10', 
    address: 'Bến Tre', status: UserStatus.ACTIVE, departmentId: 'd1', position: 'Trưởng Ban',
    currentTempleId: 't1', avatarUrl: 'https://i.pravatar.cc/150?u=p1'
  },
  { 
    _id: 'p2', fullname: 'Nguyễn Thị Thu Hà', gender: Gender.FEMALE, dateOfBirth: '2004-04-28', 
    address: '123 Lê Lợi, Quận 1', status: UserStatus.ACTIVE, departmentId: 'd3', position: 'Thư Ký',
    currentTempleId: 't1', avatarUrl: 'https://i.pravatar.cc/150?u=p2', note: 'Thành viên tích cực'
  },
  { 
    _id: 'p3', fullname: 'Trần Văn An', gender: Gender.MALE, dateOfBirth: '1985-01-15', 
    address: 'TP.HCM', status: UserStatus.ACTIVE, departmentId: 'd2', position: 'Phó Ban',
    currentTempleId: 't2', phoneNumber: '0909123456'
  },
  { 
    _id: 'p4', fullname: 'Lê Thị Bích', gender: Gender.FEMALE, dateOfBirth: '1992-09-10', 
    address: 'Bình Thạnh', status: UserStatus.ON_LEAVE, departmentId: 'd3', position: 'Thành viên',
    currentTempleId: 't1'
  },
  {
     _id: 'p5', fullname: 'Nguyễn Võ Anh Duy', gender: Gender.MALE, dateOfBirth: '2000-01-01',
     address: 'Chưa cập nhật', status: UserStatus.ACTIVE, currentTempleId: 't1',
     avatarUrl: 'https://i.pravatar.cc/150?u=p5'
  }
];

// 4. USERS
export const MOCK_USERS: User[] = [
  { _id: 'u1', phoneNumber: '0909000001', role: UserRole.ADMIN, personalId: 'p1', createdAt: '2023-01-01' },
  { _id: 'u2', phoneNumber: '0909123456', role: UserRole.MANAGER, personalId: 'p3', createdAt: '2023-05-20' },
  { _id: 'u3', phoneNumber: '0912345678', role: UserRole.MEMBER, personalId: 'p2', createdAt: '2024-01-10' },
];

// 5. EVENTS
export const MOCK_EVENTS: Event[] = [
  { 
    _id: 'e1', name: 'Đại Lễ Vía Đức Chí Tôn', startTime: '2024-02-18T08:00:00', endTime: '2024-02-18T12:00:00',
    location: 'Chánh Điện - Thánh Thất Trung Minh', eventType: 'Lễ lớn', status: EventStatus.UPCOMING,
    organizerId: 'p1', participantsCount: 500, bannerUrl: 'https://picsum.photos/id/10/800/400'
  },
  { 
    _id: 'e2', name: 'Họp Ban Cai Quản Quý 1', startTime: '2024-03-10T14:00:00', endTime: '2024-03-10T16:00:00',
    location: 'Phòng Họp A', eventType: 'Họp nội bộ', status: EventStatus.UPCOMING,
    organizerId: 'p1', participantsCount: 15
  },
  { 
    _id: 'e3', name: 'Trại Hè Thanh Niên', startTime: '2023-07-20T07:00:00', endTime: '2023-07-22T17:00:00',
    location: 'Sân Lễ', eventType: 'Hoạt động thanh niên', status: EventStatus.COMPLETED,
    organizerId: 'p3', participantsCount: 120
  }
];

// 6. BOOKS
export const MOCK_BOOKS: Book[] = [
  { 
    _id: 'b1', title: 'Hiến chương Đại Đạo', categories: ['Giáo lý', 'Quy chế'], uploadedBy: 'u1', 
    uploadDate: '2023-12-01', fileUrl: '#', fileType: 'pdf', downloadCount: 120, viewCount: 450 
  },
  { 
    _id: 'b2', title: 'Giáo lý căn bản', categories: ['Giáo lý'], uploadedBy: 'u1', 
    uploadDate: '2024-01-15', fileUrl: '#', fileType: 'docx', downloadCount: 85, viewCount: 200 
  }
];

// 7. SONGS
export const MOCK_SONGS: Song[] = [
  { 
    _id: 's1', title: 'Nguyện Cầu', category: 'Cầu nguyện', uploadedBy: 'u2', 
    uploadDate: '2024-02-01', audioUrl: '#', duration: 345, playCount: 1024,
    coverImageUrl: 'https://picsum.photos/id/1025/200/200'
  },
  { 
    _id: 's2', title: 'Đạo Ca Trung Minh', category: 'Lễ hội', uploadedBy: 'u1', 
    uploadDate: '2023-11-20', audioUrl: '#', duration: 280, playCount: 560
  }
];

// 8. VIDEOS
export const MOCK_VIDEOS: Video[] = [
  {
    _id: 'v1',
    title: 'Thuyết Đạo: Ý nghĩa ngày Vía Đức Chí Tôn',
    description: 'Bài thuyết đạo của Giáo Hữu Ngọc Minh về nguồn gốc và ý nghĩa ngày Đại Lễ Vía Đức Chí Tôn mùng 9 tháng Giêng.',
    youtubeId: 'e2Nf8P5Qx8E', // Random ID for demo
    uploadedBy: 'u1',
    uploadDate: '2024-01-10',
    category: 'Thuyết Đạo',
    viewCount: 1540
  },
  {
    _id: 'v2',
    title: 'Phóng sự: Lễ hội Yến Diêu Trì Cung 2023',
    description: 'Nhìn lại những hình ảnh đẹp trong Đại lễ Hội Yến Diêu Trì Cung năm Quý Mão.',
    youtubeId: 'LXb3EKWsInQ', // Random ID for demo
    uploadedBy: 'u2',
    uploadDate: '2023-09-30',
    category: 'Lễ Hội',
    viewCount: 3200
  },
  {
    _id: 'v3',
    title: 'Hướng dẫn nghi thức cúng Tứ Thời',
    description: 'Video hướng dẫn chi tiết về nghi thức cúng thời Tý, Ngọ, Mẹo, Dậu cho tân tín đồ.',
    youtubeId: 'dQw4w9WgXcQ', // Random ID for demo
    uploadedBy: 'u1',
    uploadDate: '2023-11-15',
    category: 'Nghi Lễ',
    viewCount: 5600
  }
];

// 9. NOTIFICATIONS
export const MOCK_NOTIFICATIONS: Notification[] = [
  { _id: 'n1', title: 'Lịch họp thay đổi', message: 'Cuộc họp Ban Cai Quản dời sang 15h.', type: 'event', isRead: false, createdAt: '2024-02-26T08:00:00' },
  { _id: 'n2', title: 'Hệ thống bảo trì', message: 'Hệ thống sẽ tạm ngưng vào 00:00 tối nay.', type: 'system', isRead: true, createdAt: '2024-02-25T10:30:00' },
  { _id: 'n3', title: 'Sách mới', message: 'Đã cập nhật tài liệu Giáo lý mới.', type: 'media', isRead: true, createdAt: '2024-02-24T09:15:00' },
];

// 10. LOGS
export const MOCK_LOGS: ActivityLog[] = [
  { _id: 'l1', userId: 'u1 (Admin)', action: 'update_profile', targetCollection: 'Personals', targetId: 'p2', timestamp: '2024-02-26 10:00:00', ip: '192.168.1.1' },
  { _id: 'l2', userId: 'u2 (Manager)', action: 'create_event', targetCollection: 'Events', targetId: 'e2', timestamp: '2024-02-26 09:45:00', ip: '192.168.1.25' },
  { _id: 'l3', userId: 'u1 (Admin)', action: 'login', targetCollection: 'Users', targetId: 'u1', timestamp: '2024-02-26 08:00:00', ip: '192.168.1.1' },
];

// Helper to get personal details by user ID
export const getPersonalByUserId = (userId: string) => {
    const user = MOCK_USERS.find(u => u._id === userId);
    return user ? MOCK_PERSONALS.find(p => p._id === user.personalId) : null;
}