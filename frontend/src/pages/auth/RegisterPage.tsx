/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as Icons from "@/components/Icons";
import { useAuth } from "@/context/AuthContext";

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.fullname || !formData.phoneNumber) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);

    try {
      const success = await register({
        fullname: formData.fullname,
        phonenumber: formData.phoneNumber,
        password: formData.password,
      });

      if (success) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login");
      } else {
        setError("Đăng ký thất bại. Số điện thoại có thể đã tồn tại.");
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans overflow-hidden">
      {/* ===== LEFT: VISUAL ===== */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-violet-600">
          <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-sky-500 rounded-full mix-blend-multiply blur-[90px] opacity-70 animate-blob" />
          <div className="absolute top-0 -right-20 w-[500px] h-[500px] bg-rose-500 rounded-full mix-blend-multiply blur-[90px] opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-20 left-20 w-[500px] h-[500px] bg-cyan-400 rounded-full mix-blend-multiply blur-[90px] opacity-70 animate-blob animation-delay-4000" />
        </div>

        <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

        <div className="relative z-10 text-center max-w-lg text-white">
          <div className="mb-10 inline-flex p-8 bg-white/10 backdrop-blur-2xl rounded-[3rem] border border-white/20 shadow-2xl">
            <img
              src="/logoThanhThat.png"
              alt="Logo"
              className="w-28 h-28 object-contain rounded-full"
            />
          </div>

          <h1 className="text-5xl font-black mb-6 leading-tight">
            Khởi Đầu <br />
            <span className="text-violet-200">Hành Trình Mới</span>
          </h1>

          <p className="text-white/90 text-lg">
            Gia nhập cùng Thánh Thất Trung Minh.
          </p>
        </div>
      </div>

      {/* ===== RIGHT: REGISTER FORM ===== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white relative overflow-y-auto">
        <Link
          to="/"
          className="absolute top-10 left-10 flex items-center text-sm font-bold text-slate-500 hover:text-violet-600"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3">
            <Icons.ArrowLeft className="w-4 h-4" />
          </div>
          Trang chủ
        </Link>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 py-10">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 mb-3">
              Tạo tài khoản
            </h2>
            <p className="text-slate-500 font-medium">
              Gia nhập đại gia đình Trung Minh hôm nay.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center text-rose-700 text-sm">
                <Icons.AlertTriangle className="w-5 h-5 mr-3 text-rose-500" />
                {error}
              </div>
            )}

            {/* Fullname */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Họ tên
              </label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-300">
                  <Icons.User className="w-5 h-5" />
                </div>
                <input
                  name="fullname"
                  required
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-14 pr-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-violet-500 focus:bg-white outline-none font-semibold"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Số điện thoại
              </label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-300">
                  <Icons.Phone className="w-5 h-5" />
                </div>
                <input
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="09xx xxx xxx"
                  className="w-full pl-14 pr-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-violet-500 focus:bg-white outline-none font-semibold"
                />
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <input
                name="password"
                type="password"
                required
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                className="px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-violet-500 focus:bg-white outline-none font-semibold"
              />
              <input
                name="confirmPassword"
                type="password"
                required
                placeholder="Xác nhận"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-violet-500 focus:bg-white outline-none font-semibold"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 rounded-2xl bg-violet-600 text-white font-black shadow-xl hover:bg-violet-700 hover:-translate-y-1 transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                "ĐĂNG KÝ"
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-bold">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-violet-600 hover:underline"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-50px) scale(1.1); }
          66% { transform: translate(-20px,20px) scale(0.9); }
          100% { transform: translate(0,0) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};
