"use client";
import React, { useState } from "react";
import Link from 'next/link';
import Image from "next/image";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setNameError("");
    setPasswordError("");

    // Email Validation
    if (!email) {
      setEmailError("이메일은 필수 입력 항목입니다.");
      isValid = false;
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setEmailError("유효한 이메일 주소를 입력해 주세요.");
      isValid = false;
    }

    // Name Validation
    if (!name) {
      setNameError("이름은 필수 입력 항목입니다.");
      isValid = false;
    } else if (name.length < 2 || name.length > 20) {
      setNameError("이름은 2자 이상 20자 이하로 입력해야 합니다.");
      isValid = false;
    }

    // Password Validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$])[A-Za-z\d!@#$]{8,}$/;
    if (!password) {
      setPasswordError("비밀번호는 필수 입력 항목입니다.");
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      setPasswordError("비밀번호는 최소 8자 이상이며, 영문, 숫자, 특수문자(!, @,#,$)를 각각 하나 이상 포함해야 합니다.");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    
    // Backend API call
    const res = await fetch("http://localhost:8080/api/user/signup", {
      method: "POST",
      headers: {
        "Content-Type" : "application/json",
      },
      body: JSON.stringify({ email: email.trim(), name: name.trim(), password: password.trim() }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log("회원가입 성공:", data);
      alert("회원가입 성공!");
      // Optionally redirect to login page or home page
    } else {
      const err = await res.json();
      console.error("회원가입 실패:", err);
      alert(`회원가입 실패: ${err.message || "서버 오류"}`);
    }
  };

  return (
    <div className="container-fluid" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="row g-0 h-100">
        {/* Image Column */}
        <div className="col-md-6 col-lg-7 d-none d-md-block">
          <Image
            src="/images/coffee-darkroast.png"
            alt="Signup background"
            width={800}
            height={1200}
            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
          />
        </div>

        {/* Form Column */}
        <div className="col-md-6 col-lg-5 d-flex align-items-center justify-content-center bg-light">
          <div className="w-100" style={{ maxWidth: '400px' }}>
            <div className="card-body p-4 p-sm-5">
              <h1 className="text-center mb-4 fw-bold">회원가입</h1>
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-floating mb-3">
                  <input
                    id="name"
                    type="text"
                    className={`form-control ${nameError ? 'is-invalid' : ''}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름"
                    required
                  />
                  <label htmlFor="name">이름</label>
                  {nameError && <div className="invalid-feedback">{nameError}</div>}
                </div>

                <div className="form-floating mb-3">
                  <input
                    id="email"
                    type="email"
                    className={`form-control ${emailError ? 'is-invalid' : ''}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                  <label htmlFor="email">이메일</label>
                  {emailError && <div className="invalid-feedback">{emailError}</div>}
                </div>

                <div className="form-floating mb-4">
                  <input
                    id="password"
                    type="password"
                    className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                    required
                  />
                  <label htmlFor="password">비밀번호</label>
                  {passwordError && <div className="invalid-feedback">{passwordError}</div>}
                </div>

                <button type="submit" className="btn btn-dark w-100 py-2">
                  회원가입
                </button>
              </form>
              <div className="text-center mt-4">
                <p className="mb-0">이미 계정이 있으신가요? <Link href="/login" className="fw-bold">로그인</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}