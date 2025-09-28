"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductList from "@/app/components/ProductList";
import CartSummary from "@/app/components/CartSummary";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function UserPage() {
  const { products, cartItems, totalAmount, addToCart, deleteToCart, checkout, isLoading } = useCart();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, authLoading, router]);

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
    <div>
      {/* 관리자 네비게이션 (관리자일 때만 표시) */}
      {isAdmin && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">상품 목록</h1>
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
        <div className="mb-4">
          <h1 className="mb-0">상품 목록</h1>
        </div>
      )}
      
      <div className="row">
        <div className="col-md-8">
          <ProductList 
            products={products} 
            onAddToCart={isAdmin ? undefined : addToCart} 
            deleteToCart={isAdmin ? undefined : deleteToCart} 
          />
        </div>
        <div className="col-md-4">
          {!isAdmin && (
            <CartSummary cartItems={cartItems} totalAmount={totalAmount} products={products} onCheckout={checkout} />
          )}
          {isAdmin && (
            <div className="card">
              <div className="card-body text-center">
                <i className="bi bi-info-circle text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                <h5 className="card-title">관리자 모드</h5>
                <p className="card-text text-muted">
                  관리자는 상품을 주문할 수 없습니다.<br />
                  상품 관리 기능을 사용하세요.
                </p>
                <a href="/admin/products" className="btn btn-primary">
                  <i className="bi bi-gear me-1"></i>
                  상품 관리
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


