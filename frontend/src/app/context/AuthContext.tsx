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
      // 세션 복원 실패
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
        
        // 상태 업데이트 완료를 위해 Promise 반환
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(nextUser);
          }, 100);
        });
      }
      
      return null;
    } catch (err) {
      // 로그인 실패시 오류 처리
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const logout = () => {
    // 현재 사용자 역할 저장 (상태 초기화 전에)
    const currentUserRole = user?.role;
    
    // 클라이언트 데이터 정리
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("addedProducts");
    
    // 사용자 상태 초기화
    setUser(null);
    
    // 적절한 페이지로 리다이렉트 (모든 사용자는 로그인 페이지로)
    router.push("/login");
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