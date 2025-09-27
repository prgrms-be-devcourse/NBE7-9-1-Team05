"use client";

import ProductList from "@/app/components/ProductList";
import CartSummary from "@/app/components/CartSummary";
import { useCart } from '../context/CartContext';

export default function UserPage() {
  const { products, cartItems, totalAmount, addToCart, deleteToCart, checkout, isLoading } = useCart();

  if (isLoading) {
    return <div className="text-center"><h2>상품 목록을 불러오는 중...</h2></div>;
  }

  return (
    <div className="row">
      <div className="col-md-8">
        <ProductList products={products} onAddToCart={addToCart} deleteToCart={deleteToCart} />
      </div>
      <div className="col-md-4">
        <CartSummary cartItems={cartItems} totalAmount={totalAmount} onCheckout={checkout} />
      </div>
    </div>
  );
}


