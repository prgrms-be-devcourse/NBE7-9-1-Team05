"use client";

import React, { useEffect, useState } from 'react';
import { orderApi } from '../../services/orderApi';
import { Order } from '../../context/CartContext'; // Order 타입을 가져옵니다.

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await orderApi.getAllOrders();
        if (response.success) {
          setOrders(response.data);
        } else {
          setError(response.message || '주문 목록을 불러오는 데 실패했습니다.');
        }
      } catch (err) {
        setError('주문 목록을 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h1 className="mt-4">주문 관리</h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>주문ID</th>
            <th>고객 이메일</th>
            <th>총액</th>
            <th>상태</th>
            <th>주문일시</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.email}</td>
                <td>{o.totalAmount.toLocaleString()}원</td>
                <td>{o.status}</td>
                <td>{new Date(o.orderDate).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">주문이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
