import { BrowserRouter } from "react-router";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { useEffect } from "react";
import analyticsService from "./services/analyticsService";
// Auth Pages
import { AuthProvider } from "./context/AuthContext";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { LoginPage } from "./pages/auth/LoginPage";

// Public Pages
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { LandingPage } from "./pages/LandingPage";
import { PublicEventsPage } from "./pages/PublicEventsPage";
import { PublicLibraryPage } from "./pages/PublicLibraryPage";
import { PublicLayout } from "./pages/PublicLayout";
import { UserProfilePage } from "./pages/UserProfilePage";
import { PublicGalleryPage } from "./pages/PublicGalleryPage";
import { NotificationsPage } from "./pages/NotificationPage";
import { PublicCalendarPage } from "./pages/PublicCalendarPage";

// Admin Pages
import { Dashboard } from "./pages/admin/dashboard/Dashboard";
import { DashboardLayout } from "./pages/admin/dashboard/DashboardLayout";
import {EventPage} from "./pages/admin/event/Events";
import { Library } from "./pages/admin/library/Library";
import { GalleryManagement } from "./pages/admin/library/Gallery";
import { Notifications } from "./pages/admin/notify/Notifications";
import { DepartmentPage } from "./pages/admin/organization/Department";
import { TemplePage } from "./pages/admin/organization/Temple";
import { PersonalPage } from "./pages/admin/personal/Personal";
import { ActivityLogs } from "./pages/admin/system/ActivityLogs";
import { Roles } from "./pages/admin/system/Roles";
import { Support } from "./pages/admin/system/Support";

import { Toaster } from "sonner";
import { PasswordChangeGuard } from "./components/PasswordChangeGuard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserRole } from "./types";

// Component để track page views
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Chỉ track page view cho trang chủ
    if (location.pathname === '/') {
      analyticsService.trackPageView(location.pathname);
    }
  }, [location]);

  return null;
}

function App() {
  return (
    <>
      <Toaster richColors />
      <AuthProvider>
        <PasswordChangeGuard>
          <BrowserRouter>
            <PageTracker />
            <ScrollToTop />
            <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/events" element={<PublicEventsPage />} />
              <Route path="/library" element={<PublicLibraryPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/gallery" element={<PublicGalleryPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/calendar" element={<PublicCalendarPage />} />
            </Route>

            {/* Admin Routes - Protected */}
            <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]} />}>
              <Route path="/admin" element={<DashboardLayout />}>
                <Route
                  index
                  element={<Navigate to="/admin/dashboard" replace />}
                />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="personals" element={<PersonalPage />} />
                <Route path="temples" element={<TemplePage />} />
                <Route path="departments" element={<DepartmentPage />} />
                <Route path="events" element={<EventPage />} />
                <Route path="library" element={<Library />} />
                <Route path="gallery" element={<GalleryManagement />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="support" element={<Support />} />
                <Route path="roles" element={<Roles />} />
                <Route path="logs" element={<ActivityLogs />} />
              </Route>
            </Route>

            {/* Auth Routes */}
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
        </PasswordChangeGuard>
      </AuthProvider>
    </>
  );
}

export default App;
