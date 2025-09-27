import { jwtDecode } from "jwt-decode";

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// 타입 정의
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  stock?: number;
}

export interface CartItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  items: CartItem[];
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  createdAt: string;
}

export interface UserInfo {
  id: number;
  email: string;
  roles: string[];
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  roles: string[];   // 항상 배열로 통일
  userId: number;
  email: string;
  name: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface DecodedToken {
  id?: number;
  userId?: number;
  sub?: string;
  email?: string;
  role?: string;
  roles?: string[];
  name?: string;
  exp?: number;
}

// JWT 토큰 관리 유틸리티
export const tokenUtils = {
  isValid: (token: string): boolean => {
    if (!token) return false;
    try {
      const payload = jwtDecode<DecodedToken>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp ? payload.exp > currentTime : false;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  getTimeUntilExpiry: (token: string): number => {
    if (!token) return 0;
    try {
      const payload = jwtDecode<DecodedToken>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp ? Math.max(0, payload.exp - currentTime) : 0;
    } catch (error) {
      console.error('Token expiry check error:', error);
      return 0;
    }
  },

  getUserInfo: (token: string): UserInfo | null => {
    if (!token) return null;
    try {
      const payload = jwtDecode<DecodedToken>(token);
      return {
        id: payload.id || payload.userId || 0,
        email: payload.sub || payload.email || '',
        roles: payload.roles ?? (payload.role ? [payload.role] : []),
        name: payload.name || '사용자',
      };
    } catch (error) {
      console.error('Token user info extraction error:', error);
      return null;
    }
  },
};

// API 요청 헬퍼 함수
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    if (token === "mock-token") {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else if (tokenUtils.isValid(token)) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        errorMessage = 'Session expired. Please log in again.';
      }

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch (textError) {
          // 텍스트 파싱 실패 시 기본 메시지 사용
        }
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', {
      url,
      method: options.method || 'GET',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// 래핑된 API 응답용 헬퍼 함수
async function wrappedApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const data = await apiRequest<T>(endpoint, options);
    return {
      data,
      success: true,
      message: 'Request successful',
    };
  } catch (error) {
    return {
      data: null as T,
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 인증 관련 API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiRequest<LoginResponse>('/api/user/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // role을 roles로 보정하여 항상 배열 형태로 사용
      const normalizedRoles = response.roles ?? [];
      response.roles = normalizedRoles;
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

// 주문 관련 API
export const orderApi = {
  getAllOrders: async (): Promise<ApiResponse<Order[]>> => {
    try {
      return await wrappedApiRequest<Order[]>('/api/orders');
    } catch (error) {
      console.error('Get all orders API failed:', error);
      throw error;
    }
  },

  getUserOrders: async (userId?: number): Promise<ApiResponse<Order[]>> => {
    try {
      const endpoint = userId ? `/api/orders/user/${userId}` : '/api/orders/user';
      return await wrappedApiRequest<Order[]>(endpoint);
    } catch (error) {
      console.error('Get user orders API failed:', error);
      throw error;
    }
  },

  getOrderById: async (orderId: number): Promise<ApiResponse<Order>> => {
    try {
      return await wrappedApiRequest<Order>(`/api/orders/${orderId}`);
    } catch (error) {
      console.error('Get order by ID API failed:', error);
      throw error;
    }
  },

  createOrder: async (orderData: {
    items: CartItem[];
    totalAmount: number;
    shippingAddress?: string;
  }): Promise<ApiResponse<Order>> => {
    try {
      return await wrappedApiRequest<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    } catch (error) {
      console.error('Create order API failed:', error);
      throw error;
    }
  },

  updateOrderStatus: async (
    orderId: number,
    status: string
  ): Promise<ApiResponse<Order>> => {
    try {
      return await wrappedApiRequest<Order>(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Update order status API failed:', error);
      throw error;
    }
  },

  cancelOrder: async (orderId: number): Promise<ApiResponse<Order>> => {
    try {
      return await wrappedApiRequest<Order>(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Cancel order API failed:', error);
      throw error;
    }
  },
};

// 상품 관련 API
export const productApi = {
  getAllProducts: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Product[]>> => {
    try {
      let endpoint = '/api/products';
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
        if (searchParams.toString()) {
          endpoint += `?${searchParams.toString()}`;
        }
      }
      return await wrappedApiRequest<Product[]>(endpoint);
    } catch (error) {
      console.error('Get all products API failed:', error);
      throw error;
    }
  },

  getProductById: async (productId: number): Promise<ApiResponse<Product>> => {
    try {
      return await wrappedApiRequest<Product>(`/api/products/${productId}`);
    } catch (error) {
      console.error('Get product by ID API failed:', error);
      throw error;
    }
  },

  createProduct: async (productData: Omit<Product, 'id'>): Promise<ApiResponse<Product>> => {
    try {
      return await wrappedApiRequest<Product>('/api/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    } catch (error) {
      console.error('Create product API failed:', error);
      throw error;
    }
  },

  updateProduct: async (
    productId: number,
    productData: Partial<Product>
  ): Promise<ApiResponse<Product>> => {
    try {
      return await wrappedApiRequest<Product>(`/api/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
    } catch (error) {
      console.error('Update product API failed:', error);
      throw error;
    }
  },

  deleteProduct: async (productId: number): Promise<ApiResponse<null>> => {
    try {
      return await wrappedApiRequest<null>(`/api/products/${productId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete product API failed:', error);
      throw error;
    }
  },
};

// 카테고리 관련 API
export const categoryApi = {
  getAllCategories: async (): Promise<ApiResponse<string[]>> => {
    try {
      return await wrappedApiRequest<string[]>('/api/categories');
    } catch (error) {
      console.error('Get all categories API failed:', error);
      throw error;
    }
  },
};