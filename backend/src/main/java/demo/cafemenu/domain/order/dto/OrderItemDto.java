package demo.cafemenu.domain.order.dto;

import lombok.Setter;

import java.time.LocalDate;

@Setter
public class OrderItemDto {
    Long productId;
    Integer quantity;
    Integer lineAmount; // 개별 상품 총 금액
    LocalDate orderDate;

    public OrderItemDto(Long productId, Integer quantity, Integer LineAmount, LocalDate orderDate) {
        this.productId = productId;
        this.quantity = quantity;
        this.lineAmount = lineAmount;
        this.orderDate = orderDate;
    }
}
