'use client';

import React, { useEffect, useState } from 'react';
import { productApi } from '../../services/productApi';
import { Product, ProductRequest } from '../../services/api';
import { adminProductApi } from '../../services/adminProductApi';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';

export default function AdminProductsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // 상품 이미지 매핑 함수
  const getProductImage = (productId: number): string => {
    const images = [
      '/images/coffee-arabica01.png',  // ID 1: 아메리카노
      '/images/coffee-arabica02.png',  // ID 2: 라떼
      '/images/coffee-darkroast.png',  // ID 3: 카푸치노
      '/images/coffee-wholebean.png',  // ID 4: 모카
    ];
    const index = (productId - 1) % images.length;
    return images[index];
  };

  // 더미 데이터 로딩 함수
  const loadDummyData = () => {
    const dummyProducts: Product[] = [
      { id: 1, name: "아메리카노", price: 4000, description: "진한 에스프레소" },
      { id: 2, name: "라떼", price: 4500, description: "부드러운 우유 커피" },
      { id: 3, name: "카푸치노", price: 4500, description: "거품이 풍부한 커피" },
      { id: 4, name: "모카", price: 5000, description: "초콜릿이 들어간 커피" }
    ];
    
    // 로컬 저장소에서 추가된 상품들 가져오기
    const addedProducts = JSON.parse(localStorage.getItem('addedProducts') || '[]');
    const allProducts = [...dummyProducts, ...addedProducts];
    
    setProducts(allProducts);
    setError(null);
    setIsLoading(false);
  };

  // 상품 목록을 불러오는 함수
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      
      // 실제 API 호출 시도
      const response = await adminProductApi.getAllProducts();
      if (response.success) {
        setProducts(response.data);
        setError(null);
      } else {
        loadDummyData();
        setError("제품 목록을 불러오는 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error('Admin products fetch error:', err);
      loadDummyData();
      setError("제품 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // AuthContext의 로딩이 완료된 후에만 fetchProducts 실행
    if (!authLoading) {
      fetchProducts();
    }
  }, [authLoading, isAuthenticated]);

  // 새 상품 추가 핸들러 (폼 제출 시)
  const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const productName = (form.elements.namedItem('productName') as HTMLInputElement).value.trim();
    const productPrice = Number((form.elements.namedItem('productPrice') as HTMLInputElement).value);
    const productDescription = (form.elements.namedItem('productDescription') as HTMLTextAreaElement).value.trim();

    // 백엔드 ProductRequest validation 규칙 적용
    if (!productName || productName.length === 0) {
      alert('제품명은 필수 입력 항목입니다.');
      return;
    }
    if (productName.length > 120) {
      alert('제품명은 최대 120자까지 입력 가능합니다.');
      return;
    }
    if (isNaN(productPrice) || productPrice < 0) {
      alert('제품 가격은 0 이상의 숫자여야 합니다.');
      return;
    }
    if (productDescription.length > 1000) {
      alert('설명은 최대 1000자까지 입력 가능합니다.');
      return;
    }

    const productRequest: ProductRequest = {
      name: productName,
      price: productPrice,
      description: productDescription
    };

    // 일단 무조건 로컬에 추가하여 UI 반응성 확보
    const newProduct: Product = {
      id: Date.now(), // 임시 ID
      name: productName,
      price: Number(productPrice),
      description: productDescription
    };

    // 즉시 UI 업데이트
    setProducts(prevProducts => [...prevProducts, newProduct]);
    
    // 로컬 저장소에 저장
    const existingAddedProducts = JSON.parse(localStorage.getItem('addedProducts') || '[]');
    const updatedAddedProducts = [...existingAddedProducts, newProduct];
    localStorage.setItem('addedProducts', JSON.stringify(updatedAddedProducts));
    
    // 폼 초기화
    form.reset();
    
    // 백그라운드에서 API 호출 시도
    try {
      const response = await adminProductApi.createProduct(productRequest);
      
      if (response.success) {
        
        // API 성공 시 임시 ID를 실제 ID로 업데이트
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p.id === newProduct.id 
              ? { ...p, id: response.data.id }
              : p
          )
        );
        
        // 로컬 저장소도 업데이트
        const updatedProducts = updatedAddedProducts.map(p =>
          p.id === newProduct.id
            ? { ...p, id: response.data.id }
            : p
        );
        localStorage.setItem('addedProducts', JSON.stringify(updatedProducts));
        
        alert('상품이 성공적으로 추가되었습니다!');
      } else {
        alert('상품이 로컬에 저장되었습니다! (API 응답 실패)');
      }
    } catch (error) {
      alert('상품이 로컬에 저장되었습니다! (API 연결 실패)');
    }
  };
  
  // 상품 수정 모달 열기
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  // 상품 수정 처리
  const handleUpdateProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingProduct) return;

    const form = event.currentTarget;
    const productName = (form.elements.namedItem('editProductName') as HTMLInputElement).value.trim();
    const productPrice = Number((form.elements.namedItem('editProductPrice') as HTMLInputElement).value);
    const productDescription = (form.elements.namedItem('editProductDescription') as HTMLTextAreaElement).value.trim();

    // 백엔드 ProductRequest validation 규칙 적용
    if (!productName || productName.length === 0) {
      alert('제품명은 필수 입력 항목입니다.');
      return;
    }
    if (productName.length > 120) {
      alert('제품명은 최대 120자까지 입력 가능합니다.');
      return;
    }
    if (isNaN(productPrice) || productPrice < 0) {
      alert('제품 가격은 0 이상의 숫자여야 합니다.');
      return;
    }
    if (productDescription.length > 1000) {
      alert('설명은 최대 1000자까지 입력 가능합니다.');
      return;
    }

    try {
      const productRequest: ProductRequest = {
        name: productName,
        price: productPrice,
        description: productDescription
      };

      
      try {
        // 실제 API 호출 시도
        const response = await adminProductApi.updateProduct(editingProduct.id, productRequest);

        if (response.success) {
          // API 성공 시 상품 목록 업데이트
          setProducts(prevProducts => 
            prevProducts.map(p => 
              p.id === editingProduct.id 
                ? { ...p, name: productName, price: Number(productPrice), description: productDescription }
                : p
            )
          );
          
          // 로컬 저장소의 추가된 상품도 업데이트
          const existingAddedProducts = JSON.parse(localStorage.getItem('addedProducts') || '[]');
          const updatedAddedProducts = existingAddedProducts.map((p: Product) =>
            p.id === editingProduct.id
              ? { ...p, name: productName, price: Number(productPrice), description: productDescription }
              : p
          );
          localStorage.setItem('addedProducts', JSON.stringify(updatedAddedProducts));
          
          setShowEditModal(false);
          setEditingProduct(null);
          alert('상품이 성공적으로 수정되었습니다!');
          return;
        }
      } catch (apiError) {
      }

      // API 실패 시 로컬에서만 수정
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === editingProduct.id 
            ? { ...p, name: productName, price: Number(productPrice), description: productDescription }
            : p
        )
      );
      
      // 로컬 저장소의 추가된 상품도 업데이트
      const existingAddedProducts = JSON.parse(localStorage.getItem('addedProducts') || '[]');
      const updatedAddedProducts = existingAddedProducts.map((p: Product) =>
        p.id === editingProduct.id
          ? { ...p, name: productName, price: Number(productPrice), description: productDescription }
          : p
      );
      localStorage.setItem('addedProducts', JSON.stringify(updatedAddedProducts));
      
      setShowEditModal(false);
      setEditingProduct(null);
      alert('상품이 로컬에서 수정되었습니다!');
    } catch (error) {
      console.error('상품 수정 중 예상치 못한 오류:', error);
      alert('상품 수정 중 오류가 발생했습니다.');
    }
  };

  // 상품 삭제 핸들러
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await adminProductApi.deleteProduct(productId);
      
      // 로컬 상태에서 제거
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      // localStorage에서도 제거
      const addedProducts = JSON.parse(localStorage.getItem('addedProducts') || '[]');
      const updatedAddedProducts = addedProducts.filter((p: Product) => p.id !== productId);
      localStorage.setItem('addedProducts', JSON.stringify(updatedAddedProducts));
      
      alert('상품이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('상품 삭제 실패:', error);
      alert('상품 삭제 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h1 className="mt-4 mb-4">상품 관리</h1>

      {/* 새 상품 추가 폼 */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>새 상품 추가</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleAddProduct}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="productName" className="form-label">
                  상품명 <span className="text-danger">*</span>
                  <small className="text-muted">(최대 120자)</small>
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="productName" 
                  maxLength={120}
                  required 
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="productPrice" className="form-label">
                  가격 (원) <span className="text-danger">*</span>
                  <small className="text-muted">(0 이상)</small>
                </label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="productPrice" 
                  min="0" 
                  step="100" 
                  required 
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="productDescription" className="form-label">
                설명 <small className="text-muted">(최대 1000자)</small>
              </label>
              <textarea 
                className="form-control" 
                id="productDescription" 
                rows={3}
                maxLength={1000}
                placeholder="상품에 대한 설명을 입력해주세요"
                required 
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              상품 추가
            </button>
          </form>
        </div>
      </div>

      {/* 상품 목록 테이블 */}
      <div className="card">
        <div className="card-header">
          <h5>상품 목록</h5>
        </div>
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>이미지</th>
                <th>상품명</th>
                <th>가격</th>
                <th>설명</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      <Image 
                        src={getProductImage(p.id)} 
                        alt={p.name} 
                        width={50} 
                        height={50} 
                        style={{ objectFit: 'cover' }}
                      />
                    </td>
                    <td>{p.name}</td>
                    <td>{p.price.toLocaleString()}원</td>
                    <td style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                      {p.description || '설명 없음'}
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary me-2" 
                        onClick={() => handleEditProduct(p)}
                        title="상품 수정"
                      >
                        수정
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={() => handleDeleteProduct(p.id)}
                        title="상품 삭제"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">상품이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 수정 모달 */}
      {showEditModal && editingProduct && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">상품 수정</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                  }}
                ></button>
              </div>
              <form onSubmit={handleUpdateProduct}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="editProductName" className="form-label">
                      상품명 <span className="text-danger">*</span>
                      <small className="text-muted">(최대 120자)</small>
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="editProductName" 
                      defaultValue={editingProduct.name}
                      maxLength={120}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editProductPrice" className="form-label">
                      가격 (원) <span className="text-danger">*</span>
                      <small className="text-muted">(0 이상)</small>
                    </label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="editProductPrice" 
                      defaultValue={editingProduct.price}
                      min="0" 
                      step="100" 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editProductDescription" className="form-label">
                      설명 <small className="text-muted">(최대 1000자)</small>
                    </label>
                    <textarea 
                      className="form-control" 
                      id="editProductDescription" 
                      rows={3}
                      defaultValue={editingProduct.description || ''}
                      maxLength={1000}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProduct(null);
                    }}
                  >
                    취소
                  </button>
                  <button type="submit" className="btn btn-primary">
                    수정 완료
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showEditModal && <div className="modal-backdrop show"></div>}
    </div>
  );
}
