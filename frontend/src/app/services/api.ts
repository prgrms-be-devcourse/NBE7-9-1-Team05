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
  id: number;           // Product.id (Long)
  name: string;         // Product.name (String, max 120)
  price: number;         // Product.price (Integer)
  description: string;   // Product.description (String, max 1000)
}

export interface CartItem {
  id?: number;           // OrderItem.id (Long, optional for new items)
  productId: number;     // OrderItem.productId (Long)
  unitPrice: number;     // OrderItem.unitPrice (Integer)
  quantity: number;      // OrderItem.quantity (Integer)
  lineAmount: number;    // OrderItem.getLineAmount() (unitPrice * quantity)
  status?: string;       // UI에서 사용하는 상태 (pending/paid)
}

// 백엔드 주문 정보와 일치하는 Order 인터페이스
export interface Order {
  orderId: number;        // 주문 ID
  email: string;          // 고객 이메일
  batchDate: string;      // 주문일 (YYYY-MM-DD)
  totalAmount: number;    // 총 금액
  status: string;         // 주문 상태 ("PAID", "PENDING" 등)
}

// UI에서 사용하는 확장된 Order 인터페이스 (주문 내역 표시용)
export interface OrderWithDetails extends Order {
  userId?: number;        // Order.user.id
  shippingAddress?: string; // Order.shippingAddress
  shippingPostcode?: string; // Order.shippingPostcode
  items?: CartItem[];      // Order.items (List<OrderItem>)
  orderDate?: Date;       // UI에서 사용하는 주문일
}

export interface UserInfo {
  id: number;           // User.id (Long)
  email: string;        // User.email (String, unique)
  role: string;         // User.role (Role enum)
  name: string;         // User.name (String)
  password?: string;    // User.password (회원가입 시에만 사용)
}

export interface LoginRequest {
  email: string;
  password: string;
}

// 회원가입 요청 (SignupRequest와 일치)
export interface SignupRequest {
  email: string;        // @Email @NotBlank
  password: string;      // @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$])[A-Za-z\\d!@#$]{8,}$")
  name: string;         // @Size(min = 2, max = 20) @NotBlank
}

// 결제 요청 (CheckoutRequest와 일치)
export interface CheckoutRequest {
  shippingAddress: string;   // @NotBlank @Size(max = 200)
  shippingPostcode: string;  // @NotBlank @Pattern(regexp = "\\d{5}")
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

    // 응답이 비어있는 경우 (204 No Content 등)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as T;
    }
    
    return await response.json();
  } catch (error) {
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
    return await apiRequest<LoginResponse>('/api/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  signup: async (userData: SignupRequest): Promise<ApiResponse<UserInfo>> => {
    return await wrappedApiRequest<UserInfo>('/api/user/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// 주문 관련 API는 orderApi.ts로 분리됨 (현재 제거됨)

// 상품 관련 API
export const productApi = {
  getAllProducts: async (): Promise<ApiResponse<Product[]>> => {
    return await wrappedApiRequest<Product[]>('/api/user/beans');
  },

  getProductById: async (productId: number): Promise<ApiResponse<Product>> => {
    return await wrappedApiRequest<Product>(`/api/products/${productId}`);
  },
};

// 장바구니 관련 API
export const cartApi = {
  addItem: async (productId: number): Promise<ApiResponse<null>> => {
    return await wrappedApiRequest<null>(`/api/user/item/${productId}`, {
      method: 'POST',
    });
  },
  
  removeItem: async (productId: number): Promise<ApiResponse<null>> => {
    return await wrappedApiRequest<null>(`/api/user/item/${productId}`, {
      method: 'DELETE',
    });
  },
};

// 체크아웃 관련 API
export const checkoutApi = {
  checkout: async (checkoutData: CheckoutRequest): Promise<ApiResponse<null>> => {
    return await wrappedApiRequest<null>('/api/user/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  },
};

// 주문 내역 관련 API
export const orderHistoryApi = {
  getUserOrders: async (): Promise<ApiResponse<Order[]>> => {
    try {
      return await wrappedApiRequest<Order[]>('/api/user/order');
    } catch (error) {
      console.error('Get user orders API failed:', error);
      // API 실패 시 빈 배열 반환
      return {
        data: [],
        success: false,
        message: '주문 내역을 불러올 수 없습니다.',
      };
    }
  },
};
