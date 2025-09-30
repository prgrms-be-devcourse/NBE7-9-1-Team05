"use client";

import { useState } from 'react';
import { CartItem, Product } from '../services/api';

export default function CartSummary({
  cartItems,
  totalAmount,
  products,
  onCheckout,
}: {
  cartItems: CartItem[];
  totalAmount: number;
  products: Product[];
  onCheckout: (formData: { address: string; zipcode: string }) => void;
}) {
  const [address, setAddress] = useState('');
  const [zipcode, setZipcode] = useState('');

  // productId로 상품명 찾기
  const getProductName = (productId: number): string => {
    // products 배열이 존재하고 유효한지 확인
    if (!products || !Array.isArray(products)) {
      return '상품 정보 로딩 중...';
    }
    
    const product = products.find(p => p.id === productId);
    return product ? product.name : '알 수 없는 상품';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckout({ address, zipcode });
    // 제출 후 폼 초기화
    setAddress('');
    setZipcode('');
  };

  return (
    <div className="card">
      <div className="card-header fw-bold">Summary</div>
      <div className="card-body">
        {cartItems.length === 0 ? (
          <div className="text-center text-muted py-4">
            <i className="bi bi-cart-x" style={{ fontSize: '2rem' }}></i>
            <p className="mt-2">장바구니가 비어있습니다.</p>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <div key={`${item.productId}-${getProductName(item.productId)}`} className="mb-2">
                <span>{getProductName(item.productId)}</span>
                <span className="ms-2 badge bg-dark rounded-pill">
                  {item.quantity}개
                </span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between align-items-center mt-3 fw-bold">
              <span>총금액</span>
              <span>{totalAmount.toLocaleString()}원</span>
            </div>

            <div className="accordion mt-3" id="checkoutAccordion">
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingOne">
                  <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCheckout" aria-expanded="false" aria-controls="collapseCheckout">
                    결제 진행하기
                  </button>
                </h2>
                <div id="collapseCheckout" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#checkoutAccordion">
                  <div className="accordion-body">
                    <small className="text-muted mb-3 d-block">
                      * 당일 오후 2시 이후의 은 다음날 배송을 시작합니다.
                    </small>
                    <form onSubmit={handleSubmit}>
                      <input 
                        type="text" 
                        placeholder="주소" 
                        className="form-control mb-3" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="우편번호 (5자리 숫자)" 
                        className="form-control mb-3" 
                        value={zipcode}
                        onChange={(e) => setZipcode(e.target.value)}
                        pattern="\d{5}"
                        maxLength={5}
                        required
                      />
                      <button type="submit" className="btn btn-dark w-100 mt-3">
                        결제하기
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}