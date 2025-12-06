import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type PropsWithChildren,
} from "react";
import { type User, type Personal, UserRole } from "../types";
import { MOCK_USERS, MOCK_PERSONALS } from "../constants";

interface AuthContextType {
  user: User | null;
  personal: Personal | null;
  isAuthenticated: boolean;
  login: (phoneNumber: string, password: string) => Promise<boolean>;
  register: (data: {
    fullname: string;
    phoneNumber: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
  updatePersonal: (data: Partial<Personal>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [user, setUser] = useState<User | null>(null);
  const [personal, setPersonal] = useState<Personal | null>(null);

  const login = async (
    phoneNumber: string,
    password: string
  ): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock Authentication Logic
    const foundUser = MOCK_USERS.find((u) => u.phoneNumber === phoneNumber);

    if (foundUser) {
      // In a real app, verify password here
      setUser(foundUser);

      const foundPersonal = MOCK_PERSONALS.find(
        (p) => p._id === foundUser.personalId
      );
      setPersonal(foundPersonal || null);
      return true;
    }
    return false;
  };

  const register = async (data: {
    fullname: string;
    phoneNumber: string;
    password: string;
  }): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real app, this would create the user in the database
    // For mock purposes, we just return true to simulate success
    return true;
  };

  const logout = () => {
    setUser(null);
    setPersonal(null);
  };

  const updatePersonal = (data: Partial<Personal>) => {
    if (personal) {
      setPersonal({ ...personal, ...data });
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
