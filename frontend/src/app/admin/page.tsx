"use client";

import { useCart } from '../context/CartContext';
import OrderStatusDisplay from '../components/OrderStatusDisplay';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROLES, OrderStatus, ORDER_STATUS } from '../services/api';

export default function AdminPage() {
  const { orders, updateOrderStatus } = useCart();
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 클라이언트 사이드에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      setUserRole(role);
      
      // 관리자 권한이 없으면 메인 페이지로 리다이렉트
      if (role !== ROLES.ADMIN) {
        alert('관리자 권한이 필요합니다.');
        router.push('/');
      }
    }
  }, [router]);
  
  // 고객별로 주문을 그룹화 (이메일 + 날짜 기준)
  const groupedOrders = orders.reduce((acc, order) => {
    const date = order.orderDate?.toDateString() || new Date().toDateString();
    const key = `${order.email || 'Unknown'}-${date}`;
    
    if (!acc[key]) {
      acc[key] = {
        customerEmail: order.email || 'Unknown',
        orderDate: order.orderDate || new Date(),
        orders: [],
        totalAmount: 0,
        status: order.status as OrderStatus
      };
    }
    
    acc[key].orders.push(order);
    acc[key].totalAmount += order.totalAmount;
    
    return acc;
  }, {} as Record<string, {
    customerEmail: string;
    orderDate: Date;
    orders: typeof orders;
    totalAmount: number;
    status: OrderStatus;
  }>);

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    alert(`주문 상태가 ${newStatus === ORDER_STATUS.PAID ? '결제완료' : '생성/결제대기'}로 변경되었습니다.`);
  };

  // 관리자 권한이 없으면 로딩 표시
  if (userRole !== ROLES.ADMIN) {
    return (
      <div className="container-fluid text-center">
        <h2>권한 확인 중...</h2>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>주문 관리</h1>
        <Link href="/admin/dashboard" className="btn btn-outline-primary">
          대시보드로 돌아가기
        </Link>
      </div>
      
      {Object.keys(groupedOrders).length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          아직 주문이 없습니다.
        </div>
      ) : (
        <div className="row">
          {Object.entries(groupedOrders).map(([key, group]) => (
            <div key={key} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">고객: {group.customerEmail}</h5>
                  <small className="text-muted">{group.orderDate.toLocaleDateString()}</small>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <OrderStatusDisplay status={group.status} />
                  </div>
                  
                  <p className="mb-2"><strong>총 금액:</strong> {group.totalAmount.toLocaleString()}원</p>
                  <p className="mb-3"><strong>주문 수:</strong> {group.orders.length}개</p>
                  
                  <div className="mb-3">
                    <h6>주문 상품:</h6>
                    <div className="list-group list-group-flush">
                      {group.orders.map((order) => (
                        <div key={order.id} className="list-group-item">
                          <div className="d-flex justify-content-between">
                            <span>주문 #{order.id}</span>
                            <span>{order.totalAmount.toLocaleString()}원</span>
                          </div>
                          <div className="mt-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="d-flex justify-content-between">
                                <span>상품 ID: {item.productId}</span>
                                <span>{item.quantity}개</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleStatusChange(group.orders[0].id, ORDER_STATUS.PAID)}
                      disabled={group.status === ORDER_STATUS.PAID}
                    >
                      결제완료
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
