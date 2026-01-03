/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as Icons from "@/components/Icons";
import { useAuth } from "@/context/AuthContext";

export const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!phoneNumber || !password) {
      setError("Vui lòng nhập đầy đủ thông tin đăng nhập.");
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(phoneNumber, password);
      if (success) {
        navigate("/");
      } else {
        setError("Số điện thoại hoặc mật khẩu không chính xác.");
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
        {/* Mesh Gradient */}
        <div className="absolute inset-0 bg-sky-500">
          <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply blur-[90px] opacity-70 animate-blob" />
          <div className="absolute top-0 -right-20 w-[500px] h-[500px] bg-rose-500 rounded-full mix-blend-multiply blur-[90px] opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-20 left-20 w-[500px] h-[500px] bg-cyan-400 rounded-full mix-blend-multiply blur-[90px] opacity-70 animate-blob animation-delay-4000" />
        </div>

        {/* Noise */}
        <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

        <div className="relative z-10 text-center max-w-lg text-white">
          <div className="mb-10 inline-flex p-8 bg-white/10 backdrop-blur-2xl rounded-[3rem] border border-white/20 shadow-2xl">
            <img
              src="../public/logoThanhThat.png"
              alt="Logo"
              className="w-28 h-28 object-contain rounded-full"
            />
          </div>

          <h1 className="text-5xl font-black mb-6 leading-tight">
            Khám Phá <br />
            <span className="text-sky-200">Đạo Tâm Mới</span>
          </h1>

          <p className="text-white/90 text-lg mb-10">
            Trải nghiệm không gian số thanh tịnh, kết nối đạo hữu bốn phương.
          </p>

          <div className="inline-flex items-center px-6 py-3 bg-white/10 rounded-2xl border border-white/20 font-bold text-sm">
            <Icons.CheckCircle className="w-5 h-5 mr-3 text-sky-300" />
            Hơn 120 Đạo hữu đã tham gia
          </div>
        </div>
      </div>

      {/* ===== RIGHT: LOGIN FORM ===== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white relative">
        <Link
          to="/"
          className="absolute top-10 left-10 flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3">
            <Icons.ArrowLeft className="w-4 h-4" />
          </div>
          Trang chủ
        </Link>

        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-3">
              Chào mừng trở lại
            </h2>
            <p className="text-slate-500 text-lg">
              Đăng nhập để tiếp tục hành trình.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center text-rose-700 text-sm">
                <Icons.AlertTriangle className="w-5 h-5 mr-3 text-rose-500" />
                {error}
              </div>
            )}

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
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full pl-14 pr-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-semibold"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Mật khẩu
              </label>
              <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-300">
                  <Icons.Shield className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 text-slate-300 hover:text-indigo-600"
                >
                  {showPassword ? (
                    <Icons.X className="w-5 h-5" />
                  ) : (
                    <Icons.MoreVertical className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-base shadow-xl hover:bg-indigo-700 hover:-translate-y-1 transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                "ĐĂNG NHẬP"
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-slate-500 font-bold">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-indigo-600 hover:underline"
              >
                Đăng ký ngay
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
