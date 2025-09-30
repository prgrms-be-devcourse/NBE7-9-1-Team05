import { jwtDecode } from "jwt-decode";

// 백엔드 API 서버 URL
const API_BASE_URL = "http://localhost:8080";

// 사용자 역할 상수
export const ROLES = {
  USER: 'ROLE_USER',
  ADMIN: 'ROLE_ADMIN'
} as const;

// 사용자 역할 타입
export type Role = typeof ROLES[keyof typeof ROLES];

// 주문 상태 상수
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID'
} as const;

// 주문 상태 타입
export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// 상품 정보 인터페이스
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

// 장바구니 아이템 인터페이스
export interface CartItem {
  id?: number;
  productId: number;
  unitPrice: number;
  quantity: number;
  lineAmount: number;
  status?: string;
}

// 주문 정보 인터페이스
export interface Order {
  orderId: number;
  email: string;
  batchDate: string;
  totalAmount: number;
  status: string;
}

// 확장된 주문 정보 인터페이스 (주문 내역 표시용)
export interface OrderWithDetails extends Order {
  userId?: number;
  shippingAddress?: string;
  shippingPostcode?: string;
  items?: CartItem[];
  orderDate?: Date;
}

// 사용자 정보 인터페이스
export interface UserInfo {
  id: number;
  email: string;
  role: string;
  name: string;
  password?: string;
}

// 로그인 요청 인터페이스
export interface LoginRequest {
  email: string;
  password: string;
}

// 회원가입 요청 인터페이스
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

// 결제 요청 인터페이스
export interface CheckoutRequest {
  shippingAddress: string;
  shippingPostcode: string;
}

// 로그인 응답 인터페이스
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  role: string;
  userId: number;
  email: string;
  name: string;
}

// 상품 생성/수정 요청 인터페이스
export interface ProductRequest {
  name: string;
  price: number;
  description: string;
}

// API 응답 공통 인터페이스
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// JWT 토큰 디코딩 인터페이스
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
  // 토큰 유효성 검증
  isValid: (token: string): boolean => {
    if (!token) return false;
    try {
      const payload = jwtDecode<DecodedToken>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp ? payload.exp > currentTime : false;
    } catch (error) {
      return false;
    }
  },

  // 토큰 만료까지 남은 시간 계산
  getTimeUntilExpiry: (token: string): number => {
    if (!token) return 0;
    try {
      const payload = jwtDecode<DecodedToken>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp ? Math.max(0, payload.exp - currentTime) : 0;
    } catch (error) {
      return 0;
    }
  },

  // 토큰에서 사용자 정보 추출
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
      return null;
    }
  },
};

// 기본 API 요청 함수
export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // JWT 토큰이 있으면 Authorization 헤더에 추가
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
      
      // 401 에러 시 토큰 삭제 및 로그인 페이지로 리다이렉트
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('addedProducts');
        errorMessage = 'Session expired. Please log in again.';
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }

      throw new Error(errorMessage);
    }

    // 빈 응답 처리 (204 No Content 등)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as T;
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// API 응답을 래핑하는 헬퍼 함수
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

export const authApi = {
  // 사용자 로그인
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return await apiRequest<LoginResponse>('/api/user/login', { 
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // 사용자 회원가입
  signup: async (userData: SignupRequest): Promise<ApiResponse<UserInfo>> => {
    return await wrappedApiRequest<UserInfo>('/api/user/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

export const productApi = {
  // 사용자용 상품 목록 조회
  getAllProducts: async (): Promise<ApiResponse<Product[]>> => {
    return await wrappedApiRequest<Product[]>('/api/user/beans');
  },

  // 특정 상품 상세 조회
  getProductById: async (productId: number): Promise<ApiResponse<Product>> => {
    return await wrappedApiRequest<Product>(`/api/products/${productId}`);
  },
};

export const cartApi = {
  // 장바구니에 상품 추가
  addItem: async (productId: number): Promise<ApiResponse<null>> => {
    return await wrappedApiRequest<null>(`/api/user/item/${productId}`, {
      method: 'POST',
    });
  },
  
  // 장바구니에서 상품 삭제
  removeItem: async (productId: number): Promise<ApiResponse<null>> => {
    return await wrappedApiRequest<null>(`/api/user/item/${productId}`, {
      method: 'DELETE',
    });
  },
};

export const checkoutApi = {
  // 주문 결제 처리
  checkout: async (checkoutData: CheckoutRequest): Promise<ApiResponse<null>> => {
    return await wrappedApiRequest<null>('/api/user/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  },
};

export const orderHistoryApi = {
  // 사용자 주문 내역 조회
  getUserOrders: async (): Promise<ApiResponse<Order[]>> => {
    try {
      return await wrappedApiRequest<Order[]>('/api/user/order');
    } catch (error) {
      return {
        data: [],
        success: false,
        message: '주문 내역을 불러올 수 없습니다.',
      };
    }
  },
};
