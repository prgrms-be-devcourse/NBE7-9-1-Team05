"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로딩 중이 아닐 때만 권한 체크
    if (!isLoading) {
      // 관리자 레이아웃 권한 확인
      if (!isAuthenticated) {
        // 인증되지 않은 경우 로그인 페이지로 리다이렉트
        router.push('/login');
        return;
      }
      
      if (!isAdmin) {
        // 관리자가 아닌 경우 로그인 페이지로 리다이렉트
        alert('관리자 권한이 필요합니다.');
        router.push('/login');
        return;
      }
      
      // 관리자 접근 허용
    }
  }, [isLoading, isAdmin, isAuthenticated, user, router]);

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
      <div className="sidebar bg-white shadow-sm" style={{ width: '250px', minHeight: '100vh' }}>
        {/* Brand */}
        <div className="sidebar-brand bg-primary text-white p-3">
          <div className="d-flex align-items-center justify-content-center">
            <i className="bi bi-shield-check text-white" style={{ fontSize: '1.5rem' }}></i>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-3">
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <Link href="/admin" className="nav-link d-flex align-items-center p-3 rounded-3 text-dark">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                  <i className="bi bi-house text-primary"></i>
                </div>
                <div>
                  <div className="fw-semibold">대시보드</div>
                  <small className="text-muted">관리자 홈</small>
                </div>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/products" className="nav-link d-flex align-items-center p-3 rounded-3 text-dark">
                <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                  <i className="bi bi-box-seam text-success"></i>
                </div>
                <div>
                  <div className="fw-semibold">상품 관리</div>
                  <small className="text-muted">메뉴 관리</small>
                </div>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Content */}
      <div id="content-wrapper" className="d-flex flex-column w-100">
        <div id="content">
          <div className="container-fluid mt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
