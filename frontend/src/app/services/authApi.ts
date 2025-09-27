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
      console.error('Login API failed:', error);
      throw error;
    }
  },

  getCurrentUser: async (): Promise<ApiResponse<UserInfo>> => {
    try {
      return await wrappedApiRequest<UserInfo>('/api/user/me');
    } catch (error) {
      console.error('Get current user API failed:', error);
      throw error;
    }
  },

  logout: async (): Promise<ApiResponse<null>> => {
    try {
      return await wrappedApiRequest<null>('/api/user/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API failed:', error);
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
      console.error('Register API failed:', error);
      throw error;
    }
  },
};