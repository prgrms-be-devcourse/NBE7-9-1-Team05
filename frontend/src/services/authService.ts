import { wrappedApiRequest, apiRequest, ApiResponse, LoginRequest, LoginResponse, UserInfo } from './api';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiRequest<LoginResponse>('/api/user/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // role 필드만 사용 (roles 배열 제거)
      return response;
    } catch (error) {
      // 로그인 API 실패
      throw error;
    }
  },

  getCurrentUser: async (): Promise<ApiResponse<UserInfo>> => {
    try {
      return await wrappedApiRequest<UserInfo>('/api/user/me');
    } catch (error) {
      // 현재 사용자 API 실패
      throw error;
    }
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<ApiResponse<UserInfo>> => {
    try {
      return await wrappedApiRequest<UserInfo>('/api/user/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      // 회원가입 API 실패
      throw error;
    }
  },
};