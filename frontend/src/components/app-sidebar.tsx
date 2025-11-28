import * as React from "react"
import {
  IconChartBar,
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
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-personals-organization"
import { NavEvents } from "@/components/nav-events"
import { NavSystem } from "@/components/nav-system"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "admin",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Bảng điều khiển",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Thống kê",
      url: "#",
      icon: IconChartBar,
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
      url: "#",
      icon: IconUser,
    },
    {
      name: "Thánh Thất",
      url: "#",
      icon: IconHome,
    },
    {
      name: "Ban",
      url: "#",
      icon: IconGitFork,
    },
  ],
  eventsAndActivities: [
    {
      name: "Sự kiện",
      url: "#",
      icon: IconCalendar,
    },
    {
      name: "Thư viện",
      url: "#",
      icon: IconLibrary,
    },
    {
      name: "Thông báo",
      url: "#",
      icon: IconBell,
    },
  ],
  system: [
    {
      name: "Hỗ trợ trực tuyến",
      url: "#",
      icon: IconMessageChatbot,
    },
    {
      name: "Tài khoản & Phân quyền",
      url: "#",
      icon: IconShieldCheck,
    },
    {
      name: "Nhập ký hoạt động",
      url: "#",
      icon: IconFileTime,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Thánh Thất Trung Minh</span>
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
    </Sidebar>
  )
}
