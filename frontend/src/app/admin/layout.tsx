"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로딩 중이 아닐 때만 권한 체크
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      if (!isAdmin) {
        alert('관리자 권한이 필요합니다.');
        router.push('/login');
        return;
      }
    }
  }, [isLoading, isAdmin, isAuthenticated, isAdmin, router]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="wrapper" className="d-flex">
      {/* Sidebar */}
      <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" style={{ width: '224px' }}>
        <a className="sidebar-brand d-flex align-items-center justify-content-center" href="#">
          <div className="sidebar-brand-text mx-3">Admin</div>
        </a>
        <li className="nav-item">
          <Link href="/admin/dashboard" className="nav-link">
            대시보드
          </Link>
        </li>
        <li className="nav-item">
          <Link href="/admin/orders" className="nav-link">
            주문 관리
          </Link>
        </li>
        <li className="nav-item">
          <Link href="/admin/products" className="nav-link">
            상품 관리
          </Link>
        </li>
      </ul>

      {/* Content */}
      <div id="content-wrapper" className="d-flex flex-column w-100">
        <div id="content">
          {/* Topbar can be added here if needed */}
          <div className="container-fluid mt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
