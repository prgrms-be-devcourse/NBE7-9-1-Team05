"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, UserInfo as OriginalUserInfo, tokenUtils } from "../services/api";

interface UserInfo extends OriginalUserInfo {
  password?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserInfo | null>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const mockAdmin: UserInfo = {
    id: 999,
    email: "admin@test.com",
    roles: ["ROLE_ADMIN"],
    name: "Admin",
    password: "Admin1234!",
  };

  // 세션 복원
  React.useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");
      if (token === "mock-token" && userEmail === "admin@test.com") {
        setUser(mockAdmin);
        setIsLoading(false);
        return;
      }
      if (token && tokenUtils.isValid(token)) {
        const decoded = tokenUtils.getUserInfo(token);
        if (decoded) {
          const normalizedUser: UserInfo = {
            ...decoded,
            roles: Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles],
          };
          setUser(normalizedUser as UserInfo);
        }
      }
    } catch (e) {
      console.error("restore session failed:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 로그인
  const login = async (
    email: string,
    password: string
  ): Promise<UserInfo | null> => {
    // 목업 관리자 계정 처리
    if (email === "admin@test.com" && password === mockAdmin.password) {
      setUser(mockAdmin);
      localStorage.setItem("token", "mock-token");
      localStorage.setItem("userEmail", mockAdmin.email);
      setIsLoading(false);
      return mockAdmin;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });

      if (res?.accessToken) {
        localStorage.setItem("token", res.accessToken);
        localStorage.setItem("userEmail", res.email);

        const nextUser: UserInfo = {
          id: res.userId,
          email: res.email,
          roles: Array.isArray(res.roles) ? res.roles : [res.roles], // 항상 배열로 보정됨
          name: res.name,
        };

        setUser(nextUser);
        return nextUser;
      }
      return null;
    } catch (err) {
      console.error("AuthContext Login failed:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    const redirectPath = user?.roles?.includes("ROLE_ADMIN")
      ? "/admin/login"
      : "/login";
    setUser(null);
    router.push(redirectPath);
  };

  // 권한 체크
  const hasRole = useCallback(
    (role: string) => user?.roles?.includes(role) ?? false,
    [user]
  );

  const isAdmin = useMemo(
    () => user?.roles?.includes("ROLE_ADMIN") ?? false,
    [user]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      hasRole,
      isAdmin,
    }),
    [user, isLoading, hasRole, isAdmin]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}