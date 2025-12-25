import React, { useState, useEffect, useRef } from "react";
import * as Icons from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Gender, type Temple, type TempleHistoryEntry } from "../types";

export const UserProfilePage = () => {
  const { user, personal, isAuthenticated, updatePersonal, uploadAvatar } =
    useAuth();

  // ✅ FIX: temples phải là mảng Temple
  const [temples, setTemples] = useState<Temple[]>([]);

  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">(
    "idle"
  );
  const [newHistory, setNewHistory] = useState<Partial<TempleHistoryEntry>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ================= FETCH TEMPLES ================= */
  useEffect(() => {
    const fetchTemples = async () => {
      try {
        const res = await fetch("/api/temples");
        const data: Temple[] = await res.json();
        setTemples(data);
      } catch (err) {
        console.error("Lỗi load temples:", err);
      }
    };
    fetchTemples();
  }, []);

  /* ================= INIT FORM ================= */
  useEffect(() => {
    if (personal && user) {
      setFormData({
        fullname: personal.fullname || "",
        gender: personal.gender || Gender.OTHER,
        dateOfBirth: personal.dateOfBirth
          ? new Date(personal.dateOfBirth).toISOString().split("T")[0]
          : "",
        address: personal.address || "",
        email: personal.email || "",
        phoneNumber: user.phoneNumber || "",
        templeHistory: personal.templeHistory || [],
      });
    }
  }, [personal, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /* ================= SAVE PROFILE ================= */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaveStatus("saving");

      await updatePersonal({
        fullname: formData.fullname,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        email: formData.email,
        templeHistory: formData.templeHistory,
      });

      setSaveStatus("success");
      setIsEditing(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setSaveStatus("idle");
    }
  };

  /* ================= AVATAR ================= */
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("avatar", file);

    await uploadAvatar(formDataUpload);
  };

  /* ================= TEMPLE HISTORY ================= */
  const handleAddHistory = () => {
    if (newHistory.templeId && newHistory.startDate) {
      const entry: TempleHistoryEntry = {
        templeId: newHistory.templeId,
        startDate: newHistory.startDate,
        endDate: newHistory.endDate,
        role: newHistory.role,
      };

      setFormData((prev: any) => ({
        ...prev,
        templeHistory: [entry, ...(prev.templeHistory || [])],
      }));

      setNewHistory({});
    }
  };

  const handleRemoveHistory = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      templeHistory: prev.templeHistory.filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  /* ================= CURRENT TEMPLE ================= */
  const currentTemple = personal?.currentTempleId
    ? temples.find((t: Temple) => t._id === personal.currentTempleId)?.name ||
      "Chưa cập nhật"
    : "Chưa cập nhật";

  /* ================= RENDER ================= */
  return (
    <div className="animate-in fade-in duration-500 bg-gray-50 min-h-screen pb-12">
      <div className="h-48 bg-gradient-to-r from-blue-900 to-blue-700 relative" />

      <div className="container mx-auto px-6 -mt-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-2xl shadow-lg">
              <div className="p-8 text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={
                      personal?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${personal?.fullname}`
                    }
                    className="w-32 h-32 rounded-full object-cover"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full"
                  >
                    <Icons.Camera className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="text-xl font-bold">{personal?.fullname}</h2>
                <p className="text-sm text-gray-500">
                  {personal?.position || "Tín đồ"}
                </p>

                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 w-full border rounded-lg py-2"
                >
                  Chỉnh sửa hồ sơ
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-lg font-bold mb-4">Thông tin cá nhân</h3>

              <form
                onSubmit={handleSave}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <input
                  disabled={!isEditing}
                  value={formData.fullname || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullname: e.target.value,
                    })
                  }
                  placeholder="Họ và tên"
                  className="border p-2 rounded"
                />

                <input
                  disabled
                  value={formData.phoneNumber || ""}
                  className="border p-2 rounded bg-gray-100"
                />

                <input
                  disabled={!isEditing}
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                  placeholder="Email"
                  className="border p-2 rounded"
                />

                <input
                  type="date"
                  disabled={!isEditing}
                  value={formData.dateOfBirth || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dateOfBirth: e.target.value,
                    })
                  }
                  className="border p-2 rounded"
                />

                <div className="md:col-span-2">
                  <textarea
                    disabled={!isEditing}
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: e.target.value,
                      })
                    }
                    placeholder="Địa chỉ"
                    className="border p-2 rounded w-full"
                  />
                </div>

                {isEditing && (
                  <div className="md:col-span-2 text-right">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded"
                    >
                      Lưu
                    </button>
                  </div>
                )}
              </form>

              <div className="mt-6">
                <h4 className="font-bold mb-2">Thánh thất hiện tại</h4>
                <p>{currentTemple}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
