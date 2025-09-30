# Cafe Menu - 커피 주문 시스템

## 📋 프로젝트 개요

Cafe Menu는 커피숍을 위한 온라인 주문 관리 시스템입니다. <br>사용자는 메뉴를 조회하고 주문할 수 있으며, 관리자는 상품을 관리할 수 있습니다.

## 👥 팀원

| [<img src="https://github.com/HongRae-Kim.png" width="80"/>](https://github.com/HongRae-Kim) | [<img src="https://github.com/dbghwns123.png" width="80"/>](https://github.com/dbghwns123) | [<img src="https://github.com/xoxoisme.png" width="80"/>](https://github.com/xoxoisme) | [<img src="https://github.com/Plectranthus.png" width="80"/>](https://github.com/Plectranthus) |
|---|---|---|---|
| 김홍래 | 유호준 | 권태현 | 양희원 |


## 📝 커밋 규칙

| 타입 이름    | 내용                               |
| -------- | -------------------------------- |
| feat     | 새로운 기능에 대한 커밋                    |
| fix      | 버그 수정에 대한 커밋                     |
| build    | 빌드 관련 파일 수정 / 모듈 설치 또는 삭제에 대한 커밋 |
| chore    | 그 외 자잘한 수정에 대한 커밋                |
| ci       | CI 관련 설정 수정에 대한 커밋               |
| docs     | 문서 수정에 대한 커밋                     |
| style    | 코드 스타일 혹은 포맷 등에 관한 커밋            |
| refactor | 코드 리팩토링에 대한 커밋                   |
| test     | 테스트 코드 수정에 대한 커밋                 |
| perf     | 성능 개선에 대한 커밋                     |

### 🎯 주요 기능

- **사용자 기능**
  - 회원가입/로그인 (JWT 인증)
  - 메뉴 조회 및 장바구니 관리
  - 주문 내역 조회
  - 실시간 장바구니 상태 관리

- **관리자 기능**
  - 상품 등록/수정/삭제/조회
  - 권한 기반 접근 제어
  - 관리자 전용 대시보드

## 🏗️ 기술 스택

### Backend
- **Framework**: Spring Boot 3.5.6
- **Language**: Java 21
- **Database**: H2 Database (개발용)
- **Security**: Spring Security + JWT
- **Build Tool**: Gradle

### Frontend
- **Framework**: Next.js 15.5.4
- **Language**: TypeScript
- **Styling**: Bootstrap 5.3.3
- **State Management**: React Context API
- **Authentication**: JWT Token

## 📁 프로젝트 구조

```
NBE7-9-1-Team05/
├── backend/                 # Spring Boot 백엔드
│   ├── src/main/java/demo/cafemenu/
│   │   ├── domain/         # 도메인별 비즈니스 로직
│   │   │   ├── admin/      # 관리자 기능
│   │   │   ├── order/      # 주문 관리
│   │   │   ├── product/    # 상품 관리
│   │   │   └── user/       # 사용자 관리
│   │   ├── global/         # 전역 설정
│   │   │   ├── config/     # 설정 클래스
│   │   │   ├── exception/  # 예외 처리
│   │   │   ├── jwt/        # JWT 관련
│   │   │   └── security/   # 보안 설정
│   │   └── CafeMenuApplication.java
│   ├── src/main/resources/
│   │   └── application.yml # 설정 파일
│   └── build.gradle.kts    # Gradle 설정
├── frontend/               # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/            # Next.js App Router (페이지와 라우팅)
│   │   │   ├── admin/      # 관리자 페이지
│   │   │   ├── login/      # 로그인 페이지
│   │   │   ├── order/      # 주문 관련 페이지
│   │   │   ├── products/   # 상품 페이지
│   │   │   ├── user/       # 사용자 페이지
│   │   │   ├── layout.tsx  # 루트 레이아웃
│   │   │   └── page.tsx    # 홈페이지
│   │   ├── components/     # 재사용 컴포넌트
│   │   │   ├── CartSummary.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── ProductList.tsx
│   │   ├── context/        # React Context (전역 상태 관리)
│   │   │   ├── AuthContext.tsx
│   │   │   └── CartContext.tsx
│   │   └── services/        # API 서비스 (TypeScript DDL)
│   │       ├── adminProductService.ts
│   │       ├── api.ts
│   │       ├── authService.ts
│   │       └── productService.ts
│   ├── public/             # 정적 파일
│   │   ├── favicon.ico
│   │   └── images/
│   └── package.json        # NPM 설정
└── README.md
```

## 🚀 시작하기

### Backend 실행
        
```bash
cd backend
./gradlew bootRun
```

백엔드 서버가 `http://localhost:8080`에서 실행됩니다.

### Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

프론트엔드가 `http://localhost:3000`에서 실행됩니다.

## 📚 API 문서

### 인증 API
- `POST /api/user/signup` - 회원가입
- `POST /api/user/login` - 로그인

### 상품 API
- `GET /api/user/beans` - 상품 조회 (사용자)
- `GET /api/admin/beans` - 상품 조회 (관리자)
- `POST /api/admin/beans` - 상품 등록
- `PUT /api/admin/beans/{beanId}` - 상품 수정
- `DELETE /api/admin/beans/{beanId}` - 상품 삭제

### 주문 API
- `GET /api/user/order` - 주문 내역 조회
- `GET /api/user/order/cart` - 장바구니 조회
- `POST /api/user/item/{productId}` - 장바구니 아이템 추가
- `DELETE /api/user/item/{productId}` - 장바구니 아이템 삭제
- `POST /api/user/orders/checkout` - 주문 결제

## 🔐 인증 및 권한

### 사용자 권한
- **ROLE_USER**: 일반 사용자 (메뉴 조회, 주문, 장바구니 관리)
- **ROLE_ADMIN**: 관리자 (상품 CRUD, 관리자 대시보드)

### JWT 토큰
- Access Token 기반 인증
- 토큰 만료 시 자동 로그아웃
- 권한별 API 접근 제어

## 🗄️ 데이터베이스

### 주요 엔티티
- **User**: 사용자 정보 (이메일, 비밀번호, 권한)
- **Product**: 상품 정보 (이름, 가격, 설명)
- **Order**: 주문 정보 (사용자, 상태, 총액, 배송지)
- **OrderItem**: 주문 아이템 (상품, 수량, 단가)

### 더미 데이터
- 개발용 더미 데이터 자동 생성
- 관리자 계정: `admin@test.com` / `Admin1234!`
- 일반 사용자: `user@test.com` / `User1234!`

## 🎨 UI/UX 특징

- **실시간 상태 관리**: 장바구니 상태 실시간 업데이트
- **권한별 페이지**: 사용자/관리자 구분된 인터페이스

