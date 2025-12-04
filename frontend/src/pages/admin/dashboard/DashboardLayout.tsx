import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export const DashboardLayout = () => {
  const isMobile = useIsMobile();
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SidebarProvider>
      <AppSidebar />
      {isMobile && (
          <div className="fixed top-4 left-4 z-50">
            <SidebarTrigger />
          </div>
        )}
      <main className="min-h-screen w-full">
        <Outlet />
      </main>
      </SidebarProvider>
    </div>
  );
};
