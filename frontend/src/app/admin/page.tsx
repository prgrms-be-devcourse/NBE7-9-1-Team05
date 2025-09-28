"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  return (
    <div className="container-fluid">
      {/* 헤더 */}
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="mb-1">관리자 대시보드</h1>
          <p className="text-muted mb-0">카페 메뉴 관리 시스템</p>
        </div>
        <Link href="/" className="btn btn-outline-secondary">
          <i className="bi bi-house me-1"></i>
          홈으로
        </Link>
      </div>
      
      {/* 메인 기능 카드 */}
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-5 text-center">
              <div className="mb-4">
                <i className="bi bi-box-seam text-primary" style={{ fontSize: '4rem' }}></i>
              </div>
              <h3 className="card-title mb-3">상품 관리</h3>
              <p className="card-text text-muted mb-4">
                카페 메뉴 상품을 등록, 수정, 삭제할 수 있습니다.<br />
                관리자가 등록한 상품은 사용자들이 주문할 수 있습니다.
              </p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Link href="/admin/products" className="btn btn-primary btn-lg px-4">
                  <i className="bi bi-gear me-2"></i>
                  상품 관리 시작하기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 기능 안내 */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card border-0 bg-light">
            <div className="card-body p-4">
              <h5 className="card-title mb-3">
                <i className="bi bi-info-circle text-primary me-2"></i>
                관리 기능 안내
              </h5>
              <div className="row justify-content-center">
                <div className="col-md-8">
                  <h6 className="text-success">✅ 사용 가능한 기능</h6>
                  <ul className="list-unstyled">
                    <li><i className="bi bi-check-circle text-success me-2"></i>상품 등록 및 수정</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>상품 삭제</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>상품 목록 조회</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
