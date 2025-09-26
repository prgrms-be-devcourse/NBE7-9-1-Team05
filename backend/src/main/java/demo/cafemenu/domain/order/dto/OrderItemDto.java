package demo.cafemenu.domain.order.dto;

import lombok.Setter;

@Setter
public class OrderItemDto {
    Long productId;
    Integer quantity;
    Integer unitPrice;

    public OrderItemDto(Long productId, Integer quantity, Integer unitPrice) {
        this.productId = productId;
        this.quantity = quantity;
        this.unitPrice = quantity * unitPrice;
    }
}
