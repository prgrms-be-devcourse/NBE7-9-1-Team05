"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { isAdmin, isAuthenticated, logout, user } = useAuth();
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <Link 
          href={isAuthenticated ? (isAdmin ? "/admin" : "/user") : "/"} 
          className="navbar-brand fw-bold d-flex align-items-center"
        >
          <i className="bi bi-cup-hot-fill me-2"></i>
          <span>Grids & Circles</span>
        </Link>

        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link href="/products" className={`nav-link ${pathname === '/products' ? 'active' : ''}`}>
              상품 목록
            </Link>
          </li>
          {!isAdmin && (
            <li className="nav-item">
              <Link href="/order/history" className={`nav-link ${pathname === '/order/history' ? 'active' : ''}`}>
                주문 내역
              </Link>
            </li>
          )}
          {isAuthenticated && (
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link ${pathname === '/logout' ? 'active' : ''}`}
                onClick={logout}
              >
                로그아웃
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

