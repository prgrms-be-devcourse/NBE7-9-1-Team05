import { jwtDecode } from "jwt-decode";

// API 기본 설정
const API_BASE_URL = "http://localhost:8080";

// 백엔드 Role enum과 일치하는 상수
export const ROLES = {
  USER: 'ROLE_USER',    // 일반 유저 (user@test.com)
  ADMIN: 'ROLE_ADMIN'   // 관리자 (admin@test.com)
} as const;

// 백엔드 Role enum 타입
export type Role = typeof ROLES[keyof typeof ROLES];

// 백엔드 OrderStatus enum과 일치하는 상수 (CANCELLED 제외)
export const ORDER_STATUS = {
  PENDING: 'PENDING',   // 생성/결제대기
  PAID: 'PAID'          // 결제완료
} as const;

// 백엔드 OrderStatus enum 타입
export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// 타입 정의
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

export interface CartItem {
  id?: number;
  productId: number;
  unitPrice: number;
  quantity: number;
  lineAmount: number;
  status?: string;
}

export interface Order {
  id: number;
  userId: number;
  batchDate: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress?: string;
  shippingPostcode?: string;
  items: CartItem[];
  email?: string;
  orderDate?: Date;
}

export interface UserInfo {
  id: number;
  email: string;
  role: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  role: string;
  userId: number;
  email: string;
  name: string;
}

// 백엔드 ProductRequest와 일치하는 구조 (제품 생성/수정용)
export interface ProductRequest {
  name: string;         // @NotBlank @Size(max = 120)
  price: number;        // @NotNull @PositiveOrZero Integer
  description: string;  // @Size(max = 1000) String
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
        role: payload.role || 'ROLE_USER',
        name: payload.name || '사용자',
      };
    } catch (error) {
      console.error('Token user info extraction error:', error);
      return null;
    }
  },
};

// API 요청 헬퍼 함수
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token && tokenUtils.isValid(token)) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
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
        localStorage.removeItem('addedProducts');
        errorMessage = 'Session expired. Please log in again.';
        
        // 자동 로그아웃 처리
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
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
      url: `${API_BASE_URL}${endpoint}`,
      method: options.method || 'GET',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// 래핑된 API 응답용 헬퍼 함수
export async function wrappedApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
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
      return response;
    } catch (error) {
      console.error('Login API failed:', error);
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
};

// 상품 관련 API
export const productApi = {
  getAllProducts: async (): Promise<ApiResponse<Product[]>> => {
    try {
      return await wrappedApiRequest<Product[]>('/api/user/beans');
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
};
