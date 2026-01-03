
import React, { useState, useEffect } from 'react';
import * as Icons from '../components/Icons';
import { notificationService } from '@/services/notificationService';
import type { Notification } from '../types';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getMyNotifications();
      const notifs = response.data?.data || response.data || [];
      setNotifications(Array.isArray(notifs) ? notifs : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'event': return <Icons.Calendar className="w-5 h-5 text-blue-500" />;
      case 'system': return <Icons.Settings className="w-5 h-5 text-gray-500" />;
      case 'media': return <Icons.Library className="w-5 h-5 text-purple-500" />;
      default: return <Icons.Bell className="w-5 h-5 text-amber-500" />;
    }
  };

  const deleteNotif = async (id: string) => {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Icons.Bell className="mr-3 text-blue-600" />
                Thông báo của bạn
            </h1>
            <p className="text-gray-500 mt-1">Cập nhật tin tức và hoạt động mới nhất từ Thánh Thất</p>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={markAllAsRead}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
             >
                Đánh dấu đã đọc tất cả
             </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 pb-4">
            <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
            >
                Tất cả
            </button>
            <button 
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === 'unread' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
            >
                Chưa đọc ({notifications.filter(n => !n.isRead).length})
            </button>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
                <div className="p-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500">Đang tải thông báo...</p>
                </div>
            ) : filteredNotifs.length > 0 ? (
                <div className="divide-y divide-gray-50">
                    {filteredNotifs.map(notif => (
                        <div 
                            key={notif._id}
                            className={`p-6 flex gap-4 transition-colors relative group ${!notif.isRead ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}
                            onClick={() => markAsRead(notif._id)}
                        >
                            {!notif.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>}
                            
                            <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                {getNotifIcon(notif.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`text-lg leading-tight ${!notif.isRead ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                        {notif.title}
                                    </h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4 font-medium">
                                        {new Date(notif.createdAt).toLocaleDateString('vi-VN')} {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-3">{notif.message}</p>
                                
                                <div className="flex items-center gap-4">
                                    {notif.link && (
                                        <a href={notif.link} className="text-blue-600 text-xs font-bold hover:underline flex items-center">
                                            Xem chi tiết <Icons.ArrowRight className="w-3 h-3 ml-1" />
                                        </a>
                                    )}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteNotif(notif._id); }}
                                        className="text-gray-400 hover:text-red-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Xóa thông báo
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                        <Icons.BellOff className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Trống trải quá...</h3>
                    <p className="text-gray-500">Bạn không có thông báo nào {filter === 'unread' ? 'chưa đọc' : ''} lúc này.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
