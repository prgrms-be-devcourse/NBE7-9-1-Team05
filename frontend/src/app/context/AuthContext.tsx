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
import { authApi, UserInfo as OriginalUserInfo, tokenUtils, ROLES } from "../services/api";

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

  // 세션 복원
  React.useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");
      
      if (token && tokenUtils.isValid(token)) {
        const decoded = tokenUtils.getUserInfo(token);
        if (decoded) {
          const normalizedUser: UserInfo = {
            ...decoded,
            role: decoded.role || ROLES.USER,
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

    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });

      if (res?.accessToken) {
        localStorage.setItem("token", res.accessToken);
        localStorage.setItem("userEmail", res.email);

        const nextUser: UserInfo = {
          id: res.userId,
          email: res.email,
          role: res.role,
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
  const logout = async () => {
    try {
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 클라이언트 데이터 정리
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("addedProducts"); // 관리자 추가 상품 정리
      
      // 사용자 상태 초기화
      setUser(null);
      
      
      // 적절한 페이지로 리다이렉트
      const redirectPath = user?.role === ROLES.ADMIN
        ? "/admin/login"
        : "/login";
      router.push(redirectPath);
    }
  };

  // 권한 체크
  const hasRole = useCallback(
    (role: string) => user?.role === role,
    [user]
  );

  const isAdmin = useMemo(
    () => user?.role === ROLES.ADMIN,
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