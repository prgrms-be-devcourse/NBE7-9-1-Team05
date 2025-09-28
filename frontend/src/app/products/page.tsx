'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { productApi } from "../services/productService";
import { adminProductApi } from "../services/adminProductService";
import { Product } from "../services/api";
import { useAuth } from "../context/AuthContext";

// 상품 ID에 따른 이미지 매핑 함수 (백엔드 더미 데이터에 맞춤)
const getProductImage = (productId: number): string => {
  const images = [
    '/images/coffee-arabica01.png',  // ID 1: 아메리카노
    '/images/coffee-arabica02.png',  // ID 2: 라떼
    '/images/coffee-darkroast.png',  // ID 3: 카푸치노
    '/images/coffee-wholebean.png',  // ID 4: 모카
  ];
  
  // 백엔드 더미 데이터 ID에 맞춰 이미지 매핑 (1-based)
  const index = (productId - 1) % images.length;
  return images[index];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // 로그인하지 않은 경우 API 호출하지 않음
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        // 관리자는 adminProductApi, 일반 사용자는 productApi 사용
        const response = isAdmin 
          ? await adminProductApi.getAllProducts()
          : await productApi.getAllProducts();
          
        if (response.success) {
          setProducts(response.data);
        } else {
          // API 실패 시 더미 데이터 + 추가된 상품 사용
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
          
          // ID 순서대로 정렬 (더미 데이터 + 추가된 상품)
          const allProducts = [...dummyProducts, ...addedProducts].sort((a, b) => a.id - b.id);
          setProducts(allProducts);
        }
      } catch (error) {
        // Error fetching products
        // 에러 발생 시에도 더미 데이터 + 추가된 상품 사용
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
        
        // ID 순서대로 정렬 (더미 데이터 + 추가된 상품)
        const allProducts = [...dummyProducts, ...addedProducts].sort((a, b) => a.id - b.id);
        setProducts(allProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [isAuthenticated, isAdmin]);

  // 로그인하지 않은 경우 로딩 화면 표시
  if (!isAuthenticated || isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h2 className="mt-3">상품 목록을 불러오는 중...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* 관리자 네비게이션 (관리자일 때만 표시) */}
      {isAdmin && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">판매중인 상품</h1>
            <div className="d-flex gap-2">
              <a href="/admin" className="btn btn-outline-primary btn-sm">
                <i className="bi bi-gear me-1"></i>
                관리자 페이지
              </a>
              <a href="/admin/products" className="btn btn-primary btn-sm">
                <i className="bi bi-box-seam me-1"></i>
                상품 관리
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* 일반 사용자용 헤더 */}
      {!isAdmin && (
        <h1 className="mb-4 text-center">판매중인 상품</h1>
      )}
      <div className="row">
        {products.map((product) => (
          <div key={product.id} className="col-lg-3 col-md-6 mb-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-img-top d-flex justify-content-center align-items-center" style={{height: '200px', backgroundColor: '#f8f9fa'}}>
                <Image 
                  src={getProductImage(product.id)} 
                  alt={product.name} 
                  width={150} 
                  height={150} 
                  className="rounded"
                  style={{objectFit: 'contain'}}
                />
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text text-muted small">
                  {product.description || "상품 설명이 없습니다."}
                </p>
                <p className="card-text fw-bold mt-auto">{product.price.toLocaleString()}원</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
