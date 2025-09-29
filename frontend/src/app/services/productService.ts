import { wrappedApiRequest, ApiResponse, Product } from './api';

export const productApi = {
  getAllProducts: async (): Promise<ApiResponse<Product[]>> => {
    try {
      // 실제 API 호출 시도
      return await wrappedApiRequest<Product[]>('/api/user/beans');
    } catch (error) {
      
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
        message: 'Dummy products loaded successfully'
      };
    }
  },

  getProductById: async (id: number): Promise<ApiResponse<Product>> => {
    // 더미 데이터에서 찾기
    const dummyProducts: Product[] = [
      { id: 1, name: "아메리카노", price: 4000, description: "진한 에스프레소" },
      { id: 2, name: "라떼", price: 4500, description: "부드러운 우유 커피" },
      { id: 3, name: "카푸치노", price: 4500, description: "거품이 풍부한 커피" },
      { id: 4, name: "모카", price: 5000, description: "초콜릿이 들어간 커피" }
    ];

    const addedProducts = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('addedProducts') || '[]')
      : [];
    
    const allProducts = [...dummyProducts, ...addedProducts].sort((a, b) => a.id - b.id);
    const product = allProducts.find(p => p.id === id);
    
    if (product) {
      return {
        data: product,
        success: true,
        message: 'Product found'
      };
    } else {
      return {
        data: null as any,
        success: false,
        message: 'Product not found'
      };
    }
  },
};