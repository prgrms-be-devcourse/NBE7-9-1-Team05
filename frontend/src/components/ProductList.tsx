"use client";

import Image from "next/image";
import { Product } from '../services/api';

// 상품 ID에 따른 이미지 매핑 함수 (백엔드 더미 데이터에 맞춤)
const getProductImage = (productId: number): string => {
  const images = [
    '/images/coffee-arabica01.png',  // ID 1: 아메리카노
    '/images/coffee-arabica02.png',  // ID 2: 라떼
    '/images/coffee-darkroast.png',  // ID 3: 카푸치노
    '/images/coffee-wholebean.png',  // ID 4: 모카
  ];
  
  // 백엔드 더미 데이터 ID에 맞춰 이미지 매핑 (1-based)
  const index = (productId - 1) % images.length;
  return images[index];
};

export default function ProductList({
  products,
  onAddToCart,
  deleteToCart,
}: {
  products: Product[];
  onAddToCart?: (product: Product) => Promise<void>;
  deleteToCart?: (product: Product) => Promise<void>;
}) {
  return (
    <div className="card mb-4">
      <div className="card-header fw-bold">상품 목록</div>
      <div className="list-group list-group-flush">
        {products.map((product) => (
          <div key={product.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Image 
                src={getProductImage(product.id)} 
                alt={product.name} 
                width={50} 
                height={50} 
                className="me-3 rounded" 
              />
              <div>
                <div>{product.name}</div>
                <div className="text-muted">{product.price.toLocaleString()}원</div>
                {product.description && (
                  <div className="text-muted small">{product.description}</div>
                )}
              </div>
            </div>
            <div className="d-flex gap-2">
              {onAddToCart ? (
                <button onClick={() => onAddToCart(product)} className="btn btn-outline-dark btn-sm">
                  추가
                </button>
              ) : (
                <button disabled className="btn btn-outline-secondary btn-sm">
                  추가
                </button>
              )}
              {deleteToCart ? (
                <button onClick={() => deleteToCart(product)} className="btn btn-outline-dark btn-sm">
                  삭제
                </button>
              ) : (
                <button disabled className="btn btn-outline-secondary btn-sm">
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}