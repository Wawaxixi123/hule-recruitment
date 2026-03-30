import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "hr" | "manager" | "interviewer" | "admin";
  avatar?: string;
  company?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  company?: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  id: "user-001",
  name: "张晓雯",
  email: "zhangxiaowen@hule.ai",
  role: "hr",
  company: "葫乐科技",
  department: "人力资源部",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("hule_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("hule_user");
      }
    }
  }, []);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Mock login - accept any email/password
    await new Promise((r) => setTimeout(r, 800));
    const loggedUser = { ...MOCK_USER, email };
    setUser(loggedUser);
    localStorage.setItem("hule_user", JSON.stringify(loggedUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("hule_user");
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1000));
    const newUser: User = {
      id: "user-" + Date.now(),
      name: data.name,
      email: data.email,
      role: "hr",
      company: data.company,
    };
    setUser(newUser);
    localStorage.setItem("hule_user", JSON.stringify(newUser));
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
