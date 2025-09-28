"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';

export default function WelcomePage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  
  const handleBrowseClick = () => {
    if (isAuthenticated) {
      // 로그인된 사용자는 역할에 따라 적절한 페이지로 이동
      if (isAdmin) {
        router.push('/user'); // 관리자도 사용자 페이지에서 상품을 볼 수 있음
      } else {
        router.push('/user');
      }
    } else {
      alert("로그인이 필요합니다.");
      router.push('/login');
    }
  }

  return (
    <div className="p-5 text-center d-flex flex-column justify-content-center align-items-center" style={{ height: 'calc(100vh - 200px)' }}>
      <h1 className="display-3 fw-bold mb-3">Grids & Circles</h1>
      <p className="lead mb-4">
        작은 로컬 카페에서 매일 정성껏 로스팅한 원두를 만나보세요.
      </p>
      <button onClick={handleBrowseClick} className="btn btn-dark btn-lg">
        상품 둘러보기
      </button>
    </div>
  );
}
