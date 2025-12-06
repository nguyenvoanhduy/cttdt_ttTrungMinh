import * as React from "react";
import {
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconUser,
  IconGitFork,
  IconHome,
  IconCalendar,
  IconLibrary,
  IconBell,
  IconMessageChatbot,
  IconShieldCheck,
  IconFileTime,
  IconPhoto,
} from "@tabler/icons-react";
import * as Icons from "./Icons";
import { NavLink } from "react-router-dom";

import { NavDocuments } from "@/components/nav-personals-organization";
import { NavEvents } from "@/components/nav-events";
import { NavSystem } from "@/components/nav-system";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "admin",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Bảng điều khiển",
      url: "/admin/dashboard",
      icon: IconDashboard,
    },
  ],
  navSecondary: [
    {
      title: "Cài đặt",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Hỗ trợ",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Tìm kiếm",
      url: "#",
      icon: IconSearch,
    },
  ],
  personalsAndOrganization: [
    {
      name: "Tín đồ",
      url: "/admin/personals",
      icon: IconUser,
    },
    {
      name: "Thánh Thất",
      url: "/admin/temples",
      icon: IconHome,
    },
    {
      name: "Ban",
      url: "/admin/departments",
      icon: IconGitFork,
    },
  ],
  eventsAndActivities: [
    {
      name: "Sự kiện",
      url: "/admin/events",
      icon: IconCalendar,
    },
    {
      name: "Thư viện",
      url: "/admin/library",
      icon: IconLibrary,
    },
    {
      name: "Thư viện ảnh",
      url: "/admin/gallery",
      icon: IconPhoto,
    },
    {
      name: "Thông báo",
      url: "/admin/notifications",
      icon: IconBell,
    },
  ],
  system: [
    {
      name: "Hỗ trợ trực tuyến",
      url: "/admin/support",
      icon: IconMessageChatbot,
    },
    {
      name: "Tài khoản & Phân quyền",
      url: "/admin/roles",
      icon: IconShieldCheck,
    },
    {
      name: "Nhập ký hoạt động",
      url: "/admin/logs",
      icon: IconFileTime,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/admin">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">
                  Thánh Thất Trung Minh
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.personalsAndOrganization} />
        <NavEvents items={data.eventsAndActivities} />
        <NavSystem items={data.system} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <div className="px-6 py-4 border-t border-gray-100">
        <NavLink
          to="/"
          className="flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium"
        >
          <Icons.ArrowLeft className="w-4 h-4 mr-2" />
          Trở về Trang chủ
        </NavLink>
      </div>
    </Sidebar>
  );
}
