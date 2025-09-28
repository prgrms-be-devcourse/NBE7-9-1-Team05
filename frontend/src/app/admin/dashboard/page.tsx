'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { orderApi } from '../../services/orderApi';
import { Order } from '../../services/api';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { isAdmin, isLoading, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      alert('관리자 권한이 필요합니다.');
      router.push('/');
    }
  }, [isLoading, isAdmin, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await orderApi.getAllOrders();
      if (response.success) {
        setOrders(response.data);
      }
    };

    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const uniqueCustomers = new Set(orders.map(order => order.userId)).size;
  const pendingOrders = orders.filter(order => order.status === 'PENDING').length;
  const paidOrders = orders.filter(order => order.status === 'PAID').length;
  const cancelledOrders = orders.filter(order => order.status === 'CANCELLED').length;

  const recentOrders = orders
    .sort((a, b) => new Date(b.batchDate).getTime() - new Date(a.batchDate).getTime())
    .slice(0, 5);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>관리자 대시보드</h1>
        <div>
          <Link href="/admin/orders" className="btn btn-outline-primary me-2">
            주문 관리
          </Link>
          <Link href="/admin" className="btn btn-primary">
            전체 주문 보기
          </Link>
          {isAuthenticated && (
            <button 
              onClick={logout}
              className="btn btn-outline-danger ms-2"
            >
              로그아웃
            </button>
          )}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{totalOrders}</h4>
                  <p className="card-text">총 주문 수</p>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-cart-check fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{totalRevenue.toLocaleString()}원</h4>
                  <p className="card-text">총 매출</p>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-currency-dollar fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{uniqueCustomers}</h4>
                  <p className="card-text">고유 고객 수</p>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-people fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{pendingOrders}</h4>
                  <p className="card-text">대기 중인 주문</p>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-clock fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* 주문 상태별 통계 */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">주문 상태별 통계</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-4">
                  <div className="border rounded p-3">
                    <h3 className="text-warning">{pendingOrders}</h3>
                    <p className="mb-0">결제 대기</p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded p-3">
                    <h3 className="text-success">{paidOrders}</h3>
                    <p className="mb-0">결제 완료</p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded p-3">
                    <h3 className="text-danger">{cancelledOrders}</h3>
                    <p className="mb-0">취소됨</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 주문 내역 */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">최근 주문 내역</h5>
              <Link href="/admin" className="btn btn-sm btn-outline-primary">
                전체 보기
              </Link>
            </div>
            <div className="card-body">
              {recentOrders.length === 0 ? (
                <p className="text-muted text-center">아직 주문이 없습니다.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>주문 번호</th>
                        <th>고객 ID</th>
                        <th>주문 일시</th>
                        <th>총 금액</th>
                        <th>상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{order.userId}</td>
                          <td>{new Date(order.batchDate).toLocaleString()}</td>
                          <td>{order.totalAmount.toLocaleString()}원</td>
                          <td>
                            <span className={`badge ${
                              order.status === 'PAID' ? 'bg-success' :
                              order.status === 'CANCELLED' ? 'bg-danger' : 'bg-warning'
                            }`}>
                              {order.status === 'PAID' ? '결제 완료' :
                               order.status === 'CANCELLED' ? '취소됨' : '결제 대기'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}