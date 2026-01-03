/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
  useEffect,
} from "react";
import { type User, type Personal } from "../types";

interface AuthContextType {
  user: User | null;
  personal: Personal | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phonenumber: string, password: string) => Promise<boolean>;
  register: (data: {
    fullname: string;
    phonenumber: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
  updatePersonal: (data: Partial<Personal>) => Promise<void>;
  uploadAvatar: (data: FormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [user, setUser] = useState<User | null>(null);
  const [personal, setPersonal] = useState<Personal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (
    phonenumber: string,
    password: string
  ): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phonenumber, password }),
      });

      const result = await res.json();
      if (!res.ok) return false;

      localStorage.setItem("accessToken", result.accessToken);
      await fetchMe();
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const register = async (data: {
    fullname: string;
    phonenumber: string;
    password: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullname: data.fullname,
          phonenumber: data.phonenumber,
          password: data.password,
          role: "Thành Viên",
        }),
      });

      return res.ok;
    } catch (err) {
      console.error("Register error:", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      setPersonal(null);
    }
  };

  const updatePersonal = async (data: Partial<Personal>) => {
    const token = localStorage.getItem("accessToken");
    if (!token || !personal) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/personals/${personal._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (res.ok) {
        const updatedPersonal = await res.json();
        setPersonal(updatedPersonal);
      }
    } catch (err) {
      console.error("Update personal error:", err);
    }
  };

  const uploadAvatar = async (formData: FormData) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3000/api/personals/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload avatar failed");
      }

      const data = await res.json();
      if (personal) {
        setPersonal({ ...personal, avatarUrl: data.avatarUrl });
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      throw err;
    }
  };

  const fetchMe = async () => {
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) {
        // Token không hợp lệ hoặc hết hạn, xóa token
        localStorage.removeItem("accessToken");
        setUser(null);
        setPersonal(null);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      setUser(data.user);
      setPersonal(data.personal);
    } catch (err) {
      console.error("Fetch me error", err);
      // Xóa token nếu có lỗi
      localStorage.removeItem("accessToken");
      setUser(null);
      setPersonal(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        personal,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updatePersonal,
        uploadAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
