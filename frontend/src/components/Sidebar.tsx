/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import * as Icons from './Icons';
import { NavLink } from 'react-router-dom';

const SidebarSection = ({ title, children }: { title?: string, children?: React.ReactNode }) => (
  <div className="mb-6">
    {title && <h3 className="px-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>}
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, to, active }: { icon: any, label: string, to: string, active?: boolean }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex items-center px-6 py-2.5 text-sm font-medium transition-colors relative
        ${isActive || active 
          ? 'text-primary-600 bg-blue-50 border-r-4 border-primary-600' 
          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'}
      `}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </NavLink>
  );
};

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-20">
      {/* Header / Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 text-white font-bold">
          T
        </div>
        <span className="text-primary-600 font-bold text-lg whitespace-nowrap overflow-hidden text-ellipsis">Thánh Thất Trung Minh</span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto py-6">
        <SidebarSection>
          <SidebarItem icon={Icons.LayoutDashboard} label="Bảng điều khiển" to="/admin/dashboard" />
          {/* <SidebarItem icon={Icons.BarChart3} label="Thống kê" to="/admin/stats" /> */}
        </SidebarSection>

        <SidebarSection title="Tín đồ & Tổ chức">
          <SidebarItem icon={Icons.Users} label="Tín đồ" to="/admin/followers" />
          <SidebarItem icon={Icons.Home} label="Thánh Thất" to="/admin/organizations" />
          <SidebarItem icon={Icons.Users2} label="Ban" to="/admin/committees" />
        </SidebarSection>

        <SidebarSection title="Sự kiện & Hoạt động">
          <SidebarItem icon={Icons.Calendar} label="Sự kiện" to="/admin/events" />
          <SidebarItem icon={Icons.Library} label="Thư viện" to="/admin/library" />
          <SidebarItem icon={Icons.Bell} label="Thông báo" to="/admin/notifications" />
        </SidebarSection>

        <SidebarSection title="Hệ thống">
          <SidebarItem icon={Icons.MessageSquare} label="Hỗ trợ trực tuyến" to="/admin/support" />
          <SidebarItem icon={Icons.Shield} label="Tài khoản & Phân quyền" to="/admin/roles" />
          <SidebarItem icon={Icons.FileClock} label="Nhật ký hoạt động" to="/admin/logs" />
        </SidebarSection>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold mr-3">
            CN
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">admin</p>
            <p className="text-xs text-gray-500 truncate">m@example.com</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <Icons.MoreVertical size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
