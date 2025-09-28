"use client";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../services/api';
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(""); 

    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const userInfo = await login(trimmedEmail, trimmedPassword);
      
      if (userInfo) {
        const isAdmin = userInfo.role === ROLES.ADMIN;
        alert(`로그인 성공! (${isAdmin ? '관리자' : '사용자'} 권한)`);
        router.push(isAdmin ? '/admin/dashboard' : '/user');
      } else {
        setLoginError("이메일 또는 비밀번호가 일치하지 않습니다.");
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="container-fluid" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="row g-0 h-100">
        {/* Image Column */}
        <div className="col-md-6 col-lg-7 d-none d-md-block">
          <Image
            src="/images/coffee-wholebean.png"
            alt="Login background"
            width={800}
            height={1200}
            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
          />
        </div>

        {/* Form Column */}
        <div className="col-md-6 col-lg-5 d-flex align-items-center justify-content-center bg-light">
          <div className="w-100" style={{ maxWidth: '400px' }}>
            <div className="card-body p-4 p-sm-5">
              <h1 className="text-center mb-4 fw-bold">로그인</h1>
              <form onSubmit={handleSubmit}>
                {loginError && <div className="alert alert-danger text-center mb-3">{loginError}</div>}
                
                <div className="form-floating mb-3">
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                  <label htmlFor="email">이메일</label>
                </div>

                <div className="form-floating mb-4">
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
                  <label htmlFor="password">비밀번호</label>
                </div>

                <button type="submit" className="btn btn-dark w-100 py-2" disabled={isLoading}>
                  {isLoading ? '로그인 중...' : '로그인'}
                </button>
              </form>
              <div className="text-center mt-4">
                <p className="mb-0">계정이 없으신가요? <Link href="/user/signup" className="fw-bold">회원가입</Link></p>
              </div>   
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}