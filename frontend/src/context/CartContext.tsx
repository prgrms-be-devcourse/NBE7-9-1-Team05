'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Order, OrderWithDetails, CartItem, OrderStatus, ORDER_STATUS, cartApi, checkoutApi, orderHistoryApi } from '../services/api';
import { productApi } from '../services/productService';
import { adminProductApi } from '../services/adminProductService';
import { useAuth } from './AuthContext';

type CartContextType = {
  products: Product[];
  cartItems: CartItem[];
  orders: OrderWithDetails[];
  totalAmount: number;
  addToCart: (product: Product) => Promise<void>;
  deleteToCart: (product: Product) => Promise<void>;
  checkout: (formData: { address: string; zipcode: string }) => Promise<void>;
  updateOrderStatus: (orderId: number, newStatus: OrderStatus) => void;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // 더미 데이터와 로컬 저장소 상품을 합치는 헬퍼 함수 (백엔드 DataInitializer와 일치)
  const getDummyAndAddedProducts = (): Product[] => {
    const dummyProducts: Product[] = [
      { id: 1, name: "아메리카노", price: 4000, description: "진한 에스프레소" },
      { id: 2, name: "라떼", price: 4500, description: "부드러운 우유 커피" },
      { id: 3, name: "카푸치노", price: 4500, description: "거품이 풍부한 커피" },
      { id: 4, name: "모카", price: 5000, description: "초콜릿이 들어간 커피" }
    ];
    
    // 로컬 저장소에서 추가된 상품들 가져오기
    const addedProducts = JSON.parse(localStorage.getItem('addedProducts') || '[]');
    
    // ID 순서대로 정렬 (더미 데이터 + 추가된 상품)
    const allProducts = [...dummyProducts, ...addedProducts];
    return allProducts.sort((a, b) => a.id - b.id);
  };

  useEffect(() => {
    const fetchData = async () => {
      // 로그인하지 않은 사용자는 빈 배열로 설정
      if (!user) {
        setProducts([]);
        setOrders([]);
        setIsLoading(false);
        return;
      }

      // 로그인한 사용자는 API 호출 시도
      try {
        // 상품 데이터 가져오기
        const productResponse = user.role === 'ROLE_ADMIN' 
          ? await adminProductApi.getAllProducts()
          : await productApi.getAllProducts();
          
        if (productResponse.success) {
          setProducts(productResponse.data);
        } else {
          // API 실패 시 더미 데이터 fallback
          const allProducts = getDummyAndAddedProducts();
          setProducts(allProducts);
        }

        // 주문 내역은 주문 내역 페이지에서만 로드 (초기 로드 시에는 빈 배열)
        setOrders([]);
      } catch (error) {
        // API 실패 시 더미 데이터 fallback
        const allProducts = getDummyAndAddedProducts();
        setProducts(allProducts);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]); // user 변경 시에만 다시 fetch

  const addToCart = async (product: Product) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // 백엔드 API 호출
      const response = await cartApi.addItem(product.id);
      
      if (response.success) {
        // API 성공 시 로컬 상태 업데이트
        setCartItems((prevCartItems) => {
          const itemInCart = prevCartItems.find((item) => item.productId === product.id);
          if (itemInCart) {
            const updatedItems = prevCartItems.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + 1, lineAmount: item.unitPrice * (item.quantity + 1), status: 'pending' }
                : item
            );
            return updatedItems;
          } else {
            const newItem = { 
              id: Date.now(), 
              productId: product.id, 
              unitPrice: product.price, 
              quantity: 1, 
              lineAmount: product.price, 
              status: 'pending' 
            };
            return [...prevCartItems, newItem];
          }
        });
        alert("상품이 장바구니에 추가되었습니다.");
      } else {
        alert(`장바구니 추가 실패: ${response.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      // JSON 파싱 에러인 경우 특별 처리
      if (error instanceof Error && error.message.includes('JSON')) {
        // 백엔드 API가 성공했지만 빈 응답을 보낸 경우로 간주하고 로컬 상태 업데이트
        setCartItems((prevCartItems) => {
          const itemInCart = prevCartItems.find((item) => item.productId === product.id);
          if (itemInCart) {
            return prevCartItems.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + 1, lineAmount: item.unitPrice * (item.quantity + 1), status: 'pending' }
                : item
            );
          } else {
            return [...prevCartItems, { 
              id: Date.now(), 
              productId: product.id, 
              unitPrice: product.price, 
              quantity: 1, 
              lineAmount: product.price, 
              status: 'pending' 
            }];
          }
        });
        alert("상품이 장바구니에 추가되었습니다.");
      } else {
        alert("장바구니 추가 중 오류가 발생했습니다.");
      }
    }
  };

  const deleteToCart = async (product: Product) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 장바구니에 해당 상품이 있는지 먼저 확인
    const itemInCart = cartItems.find((item) => item.productId === product.id);
    if (!itemInCart) {
      alert("장바구니에 해당 상품이 없습니다.");
      return;
    }

    try {
      // 백엔드 API 호출 (DB에서 PENDING 상태 아이템 삭제)
      const response = await cartApi.removeItem(product.id);
      
      if (response.success) {
        // API 성공 시 로컬 상태 업데이트
        setCartItems((prevCartItems) => {
          const itemInCart = prevCartItems.find((item) => item.productId === product.id);
          
          if (itemInCart?.quantity === 1) {
            // 수량이 1이면 완전 삭제
            return prevCartItems.filter((item) => item.productId !== product.id);
          } else if (itemInCart) {
            // 수량이 1보다 크면 수량만 감소
            return prevCartItems.map((item) =>
              item.productId === product.id
                ? { 
                    ...item, 
                    quantity: item.quantity - 1, 
                    lineAmount: item.unitPrice * (item.quantity - 1)
                  }
                : item
            );
          }
          
          return prevCartItems;
        });
        alert("상품이 장바구니에서 삭제되었습니다.");
      } else {
        // API 실패 시에도 로컬 상태 업데이트
        setCartItems((prevCartItems) => {
          const itemInCart = prevCartItems.find((item) => item.productId === product.id);
          
          if (itemInCart?.quantity === 1) {
            return prevCartItems.filter((item) => item.productId !== product.id);
          } else if (itemInCart) {
            return prevCartItems.map((item) =>
              item.productId === product.id
                ? { 
                    ...item, 
                    quantity: item.quantity - 1, 
                    lineAmount: item.unitPrice * (item.quantity - 1)
                  }
                : item
            );
          }
          
          return prevCartItems;
        });
        alert("상품이 장바구니에서 삭제되었습니다. (로컬 처리)");
      }
    } catch (error) {
      // API 실패 시 로컬 상태 업데이트
      setCartItems((prevCartItems) => {
        const itemInCart = prevCartItems.find((item) => item.productId === product.id);
        
        if (itemInCart?.quantity === 1) {
          return prevCartItems.filter((item) => item.productId !== product.id);
        } else if (itemInCart) {
          return prevCartItems.map((item) =>
            item.productId === product.id
              ? { 
                  ...item, 
                  quantity: item.quantity - 1, 
                  lineAmount: item.unitPrice * (item.quantity - 1)
                }
              : item
          );
        }
        
        return prevCartItems;
      });
      alert("상품이 장바구니에서 삭제되었습니다.");
    }
  };


  const totalAmount = cartItems.reduce((sum, item) => sum + item.lineAmount, 0);

  const checkout = async (formData: { address: string; zipcode: string }) => {
    if (cartItems.length === 0) {
      alert("장바구니가 비어있습니다.");
      return;
    }

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 배송지 정보 검증
    if (!formData.address || !formData.zipcode) {
      alert("배송지 정보를 모두 입력해주세요.");
      return;
    }

    // 우편번호 형식 검증 (5자리 숫자)
    if (!/^\d{5}$/.test(formData.zipcode)) {
      alert("우편번호는 5자리 숫자로 입력해주세요.");
      return;
    }

    try {
      // 백엔드 체크아웃 API 호출 (배송지 정보만 전송)
      const response = await checkoutApi.checkout({
        shippingAddress: formData.address,
        shippingPostcode: formData.zipcode,
      });

      if (response.success) {
        // 체크아웃 성공 시 장바구니 비우기
        setCartItems([]);
        
        // 백엔드에서 주문 내역을 자동으로 생성하므로 로컬 주문 생성 불필요
        // 주문 내역 새로고침
        try {
          const orderResponse = await orderHistoryApi.getUserOrders();
          if (orderResponse.success) {
            setOrders(orderResponse.data);
          }
        } catch (orderError) {
          // 주문 내역 새로고침 실패
        }
        
        alert("주문이 완료되었습니다!");
      } else {
        alert(`주문 실패: ${response.message || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      // JSON 파싱 에러인 경우 특별 처리 (백엔드에서 빈 응답을 보낸 경우)
      if (error instanceof Error && error.message.includes('JSON')) {
        // 백엔드 API가 성공했지만 빈 응답을 보낸 경우로 간주
        setCartItems([]);
        
        // 백엔드에서 주문 내역을 자동으로 생성하므로 로컬 주문 생성 불필요
        // 주문 내역 새로고침
        try {
          const orderResponse = await orderHistoryApi.getUserOrders();
          if (orderResponse.success) {
            setOrders(orderResponse.data);
          }
        } catch (orderError) {
          // 주문 내역 새로고침 실패
        }
        
        alert("주문이 완료되었습니다!");
      } else {
        alert("주문 중 오류가 발생했습니다.");
      }
    }
  };

  const updateOrderStatus = (orderId: number, newStatus: OrderStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.orderId === orderId 
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  const contextValue: CartContextType = {
    products,
    cartItems,
    orders,
    totalAmount,
    addToCart,
    deleteToCart,
    checkout,
    updateOrderStatus,
    isLoading,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
