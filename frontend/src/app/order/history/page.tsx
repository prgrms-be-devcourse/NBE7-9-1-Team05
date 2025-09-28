"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderWithDetails, orderHistoryApi } from '../../services/api';

export default function OrderHistoryPage() {
  const { isLoading } = useCart();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  
  // 로그인 체크 및 주문 내역 로드
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // 관리자는 주문 조회 API가 없으므로 상품 관리 페이지로 리다이렉트
    if (!authLoading && isAuthenticated && isAdmin) {
      router.push('/admin/products');
      return;
    }

    // 일반 사용자만 주문 내역 로드
    if (!authLoading && isAuthenticated && !isAdmin) {
      const loadOrders = async () => {
        try {
          const orderResponse = await orderHistoryApi.getUserOrders();
          if (orderResponse.success) {
            setOrders(orderResponse.data);
          } else {
            setOrders([]);
          }
        } catch (error) {
          setOrders([]);
        } finally {
          setOrdersLoading(false);
        }
      };
      
      loadOrders();
    }
  }, [isAuthenticated, authLoading, isAdmin, router]);

  // 백엔드 API가 이미 사용자별로 필터링된 데이터를 반환
  const userOrders: OrderWithDetails[] = orders || [];

  // 로딩 화면 표시
  if (!isAuthenticated || isLoading || ordersLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h2 className="mt-3">주문 내역을 불러오는 중...</h2>
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
            <h1 className="mb-0">주문 내역</h1>
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
        <h1 className="mb-4">주문 내역</h1>
      )}
      {userOrders.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          아직 주문 내역이 없습니다.
        </div>
      ) : (
        <div className="list-group">
          {userOrders.map((order: OrderWithDetails, index: number) => (
            <div key={`${order.orderId}-${index}`} className="list-group-item mb-3 shadow-sm">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-1">주문 번호: #{order.orderId}
                  <button
                    className="btn btn-sm btn-outline-secondary ms-2"
                    onClick={() => navigator.clipboard.writeText(order.orderId.toString())}
                    title="주문 번호 복사"
                  >
                    복사
                  </button>
                </h5>
                <small className="text-muted">{order.orderDate?.toLocaleString() || order.batchDate}</small>
              </div>
              <div className="mb-2">
                <span className={`badge ${
                  order.status === 'PAID' ? 'bg-success' : 'bg-warning'
                }`}>
                  {order.status === 'PAID' ? '결제완료' : '결제대기'}
                </span>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <p className="mb-1"><strong>총 금액:</strong> {order.totalAmount.toLocaleString()}원</p>
                  <p className="mb-1"><strong>주문일:</strong> {order.batchDate}</p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1"><strong>주문 이메일:</strong> {order.email}</p>
                </div>
              </div>
              <div className="mt-3">
                <small className="text-muted">
                  <strong>주문 상태:</strong> {order.status === 'PAID' ? '결제완료' : '대기중'} | 
                  <strong> 주문일:</strong> {order.batchDate}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
