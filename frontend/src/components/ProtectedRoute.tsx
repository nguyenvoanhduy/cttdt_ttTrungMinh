import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * Component bảo vệ các routes yêu cầu authentication
 * Chỉ cho phép người dùng đã đăng nhập và có role phù hợp truy cập
 */
export const ProtectedRoute = ({ 
  allowedRoles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER],
  redirectTo = '/login'
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Đang load thông tin user
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập -> redirect đến trang login
  if (!isAuthenticated || !user) {
    return <Navigate 
      to={redirectTo} 
      replace 
      state={{ 
        from: window.location.pathname,
        message: 'Vui lòng đăng nhập để truy cập trang này'
      }} 
    />;
  }

  // Đã đăng nhập nhưng không có quyền truy cập
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Navigate 
        to="/" 
        replace 
        state={{ 
          error: 'Bạn không có quyền truy cập trang này',
          from: window.location.pathname 
        }} 
      />
    );
  }

  // Đã đăng nhập và có quyền -> cho phép truy cập
  return <Outlet />;
};
