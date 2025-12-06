/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import * as Icons from "../components/Icons";
import { Chatbot } from "@/components/ChatBot";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";

export const PublicLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, personal, isAuthenticated, logout } = useAuth();

  // Handle scroll only once
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { label: "Trang chủ", path: "/" },
    { label: "Giới thiệu", path: "/about" },
    { label: "Sự kiện", path: "/events" },
    { label: "Thư viện", path: "/library" },
    { label: "Thư viện ảnh", path: "/gallery" },
    { label: "Liên hệ", path: "/contact" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      {/* --- NAVIGATION --- */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b
        ${
          isScrolled || location.pathname !== "/"
            ? "bg-white/95 backdrop-blur-md shadow-sm border-gray-100 py-3"
            : "bg-white border-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group relative">
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 
              flex items-center justify-center transition-transform group-hover:scale-110 
              overflow-hidden relative"
            >
              <img
                src="../../public/logoThanhThat.png"
                className="w-8 h-8 object-fill"
                alt="Logo"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              {/* Fallback Icon */}
              <Icons.Home className="hidden" />
            </div>

            <div>
              <span className="block font-bold text-lg leading-none text-blue-900">
                THÁNH THẤT TRUNG MINH
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors hover:text-blue-600 
                ${
                  location.pathname === link.path
                    ? "text-blue-600 font-bold"
                    : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                >
                  <img
                    src={
                      personal?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${personal?.fullname}&background=random`
                    }
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-700 max-w-[200px] truncate">
                    {personal?.fullname}
                  </span>
                  <Icons.ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {personal?.fullname}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.phoneNumber}
                      </p>
                    </div>
                    <div className="p-1">
                      {(user?.role === UserRole.ADMIN ||
                        user?.role === UserRole.MANAGER) && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium mb-1"
                        >
                          <Icons.LayoutDashboard className="w-4 h-4 mr-2" />
                          Quản trị hệ thống
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Icons.User className="w-4 h-4 mr-2" />
                        Thông tin cá nhân
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Icons.LogOut className="w-4 h-4 mr-2" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md bg-blue-900 text-white hover:bg-blue-800 hover:shadow-lg group"
              >
                <Icons.LogIn className="w-4 h-4 mr-2 opacity-80 group-hover:opacity-100" />
                Đăng nhập
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl p-4 md:hidden flex flex-col gap-2 animate-in slide-in-from-top-2">
            {isAuthenticated && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-2">
                <img
                  src={
                    personal?.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${personal?.fullname}`
                  }
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-bold text-sm text-gray-900">
                    {personal?.fullname}
                  </p>
                  <p className="text-xs text-blue-600">{user?.role}</p>
                </div>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-800 font-medium py-3 px-4 hover:bg-gray-50 rounded-lg"
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-gray-100 my-2" />

            {isAuthenticated ? (
              <>
                {(user?.role === UserRole.ADMIN ||
                  user?.role === UserRole.MANAGER) && (
                  <Link
                    to="/admin/dashboard"
                    className="text-blue-600 font-bold py-3 px-4 hover:bg-blue-50 rounded-lg flex items-center"
                  >
                    <Icons.LayoutDashboard className="w-4 h-4 mr-2" />
                    Quản trị hệ thống
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="text-gray-700 py-3 px-4 hover:bg-gray-50 rounded-lg flex items-center"
                >
                  <Icons.User className="w-4 h-4 mr-2" />
                  Thông tin cá nhân
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-600 py-3 px-4 hover:bg-red-50 rounded-lg flex items-center w-full text-left"
                >
                  <Icons.LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white py-3 rounded-lg font-bold text-center"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        )}
      </header>
      {/* --- PAGE CONTENT --- */}
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-8 border-t border-gray-800">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-2xl flex items-center justify-center bg-transparent overflow-hidden">
                <img
                  src="../../public/logoThanhThat.png"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white font-bold text-lg">Trung Minh</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Cổng thông tin điện tử chính thức của Thánh Thất Trung Minh. Nơi
              kết nối và lan tỏa giá trị Chân - Thiện - Mỹ.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/GiaDinhHungDaoTrungMinh"
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
              >
                <Icons.Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
              >
                <Icons.Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Liên Kết Nhanh</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-amber-400 transition-colors"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="hover:text-amber-400 transition-colors"
                >
                  Sự kiện & Lễ hội
                </Link>
              </li>
              <li>
                <Link
                  to="/library"
                  className="hover:text-amber-400 transition-colors"
                >
                  Thư viện số
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-amber-400 transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Liên Hệ</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <Icons.MapPin className="w-5 h-5 mr-3 text-amber-500 flex-shrink-0" />
                <span>
                  609-611 Đ. Bình Thới, Phường 10, Quận 11, Thành phố Hồ Chí
                  Minh, Việt Nam
                </span>
              </li>
              <li className="flex items-center">
                <Icons.Phone className="w-5 h-5 mr-3 text-amber-500 flex-shrink-0" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center">
                <Icons.Mail className="w-5 h-5 mr-3 text-amber-500 flex-shrink-0" />
                <span>thanhthattrungminh@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-gray-500 mb-4 md:mb-0">
              © 2024 Thánh Thất Trung Minh. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-gray-500">
              <a href="#" className="hover:text-white">
                Điều khoản sử dụng
              </a>
              <a href="#" className="hover:text-white">
                Chính sách bảo mật
              </a>
            </div>
          </div>
        </div>
      </footer>
      // Chatbot
      <Chatbot />
    </div>
  );
};
