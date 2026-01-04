/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import * as Icons from "./Icons";

interface ChangePasswordModalProps {
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isFirstTime?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ 
  onClose, 
  onSubmit,
  isFirstTime = false 
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit(currentPassword, newPassword);
      if (success) {
        onClose();
      } else {
        setError("Mật khẩu hiện tại không đúng");
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={isFirstTime ? undefined : onClose}
      ></div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {isFirstTime ? "Đổi mật khẩu bắt buộc" : "Đổi mật khẩu"}
            </h3>
            {isFirstTime && (
              <p className="text-sm text-orange-600 mt-1">
                Vui lòng đổi mật khẩu mặc định để tiếp tục
              </p>
            )}
          </div>
          {!isFirstTime && (
            <button onClick={onClose}>
              <Icons.X className="w-5 h-5 text-gray-400 hover:text-red-500" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400-500 outline-none"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-8 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? (
                  <Icons.EyeOff className="w-5 h-5" />
                ) : (
                  <Icons.Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-8 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <Icons.EyeOff className="w-5 h-5" />
                ) : (
                  <Icons.Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-8 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <Icons.EyeOff className="w-5 h-5" />
                ) : (
                  <Icons.Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {isFirstTime && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm text-blue-800">
              <p>
                <strong>Lưu ý:</strong> Mật khẩu mặc định của bạn là "<strong>1</strong>". 
                Vui lòng đổi sang mật khẩu mới để bảo mật tài khoản.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {!isFirstTime && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${isFirstTime ? 'w-full' : 'flex-1'} px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
