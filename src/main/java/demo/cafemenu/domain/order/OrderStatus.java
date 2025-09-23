package demo.cafemenu.domain.order;


public enum OrderStatus {
  PENDING,    // 생성/결제대기
  PAID,       // 결제완료
  CANCELLED,  // 취소
}
