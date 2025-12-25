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
  login: (phonenumber: string, password: string) => Promise<boolean>;
  register: (data: {
    fullname: string;
    phonenumber: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
  updatePersonal: (data: Partial<Personal>) => void;
  uploadAvatar: (data: FormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [user, setUser] = useState<User | null>(null);
  const [personal, setPersonal] = useState<Personal | null>(null);

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

  const updatePersonal = (data: Partial<Personal>) => {
    if (personal) {
      setPersonal({ ...personal, ...data });
    }
  };

  const uploadAvatar = async (formData: FormData) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const res = await fetch("http://localhost:3000/api/personal/avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Upload avatar failed");

    const data = await res.json();
    updatePersonal({ avatarUrl: data.avatarUrl });
  };

  const fetchMe = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) return;

      setUser(data.user);
      setPersonal(data.personal);
    } catch (err) {
      console.error("Fetch me error", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        personal,
        isAuthenticated: !!user,
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
