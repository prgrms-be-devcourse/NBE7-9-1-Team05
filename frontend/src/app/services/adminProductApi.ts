import { wrappedApiRequest, ApiResponse, Product, ProductRequest } from './api';

export const adminProductApi = {
  getAllProducts: async (): Promise<ApiResponse<Product[]>> => {
    try {
      // 실제 API 호출 시도
      return await wrappedApiRequest<Product[]>('/api/admin/beans', {
        method: 'GET',
      });
    } catch (error) {
      console.error('Admin get all products API failed:', error);
      
      // API 실패 시 더미 데이터 fallback
      const dummyProducts: Product[] = [
        { id: 1, name: "아메리카노", price: 4000, description: "진한 에스프레소" },
        { id: 2, name: "라떼", price: 4500, description: "부드러운 우유 커피" },
        { id: 3, name: "카푸치노", price: 4500, description: "거품이 풍부한 커피" },
        { id: 4, name: "모카", price: 5000, description: "초콜릿이 들어간 커피" }
      ];

      // 로컬 저장소에서 추가된 상품들 가져오기
      const addedProducts = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('addedProducts') || '[]')
        : [];
      
      // ID 순서대로 정렬
      const allProducts = [...dummyProducts, ...addedProducts].sort((a, b) => a.id - b.id);
      
      return {
        data: allProducts,
        success: true,
        message: 'Admin dummy products loaded successfully'
      };
    }
  },

  // POST /api/admin/beans - 제품 등록 (백엔드 ProductRequest 사용)
  createProduct: async (productData: ProductRequest): Promise<ApiResponse<Product>> => {
    try {
      return await wrappedApiRequest<Product>('/api/admin/beans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData),
      });
    } catch (error) {
      console.error('Admin create product API failed:', error);
      throw error;
    }
  },

  // PUT /api/admin/beans/{beanId} - 제품 수정 (백엔드 ProductRequest 사용)
  updateProduct: async (beanId: number, productData: ProductRequest): Promise<ApiResponse<Product>> => {
    try {
      return await wrappedApiRequest<Product>(`/api/admin/beans/${beanId}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });
    } catch (error) {
      console.error('Admin update product API failed:', error);
      throw error;
    }
  },

  deleteProduct: async (productId: number): Promise<ApiResponse<void>> => {
    try {
      return await wrappedApiRequest<void>(`/api/admin/beans/${productId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Admin delete product API failed:', error);
      throw error;
    }
  },
  
};